import {UserEvent} from "../types";
import {Database} from "bun:sqlite";

// Define interface for the repo
export interface IUserFinanceRepository {
    logTxn(e: UserEvent): void;
    getPreviousTxnsForUser(user_id: number, limit: number): Promise<UserEvent[]>;
    getPreviousTxnsForUserOfType(user_id: number, limit: number, type: string): Promise<UserEvent[]>;
    getAlertableSingleWithdrawalAmount(): Promise<number>;
    getAlertableShortTermAccumulativeAmount(): Promise<number>;
    getNumberOfAlertableConsecutiveWithdrawals(): Promise<number>;
    getNumberOfAlertableConsecutiveIncreasingDeposits(): Promise<number>;
    getNumberOfAlertableShortTermAccumulativeDeposits(): Promise<number>;
}

export class FinanceRepository implements IUserFinanceRepository {
    private static instance: FinanceRepository;
    private connection: Database | undefined;

    private constructor() {
        this.createConnection().then((db: Database) => {
            this.connection = db;
        });
    }

    public static getInstance(): FinanceRepository {
        if (!FinanceRepository.instance) {
            FinanceRepository.instance = new FinanceRepository();
        }
        return FinanceRepository.instance;
    }

    private async createConnection(): Promise<Database> {
        const db: Database = new Database("src/db.sqlite", { create: true });

        const createTablesQuery: string = await this.readSqlFromFile('create_tables.sql');

        try {
            db.exec(createTablesQuery);
        } catch(e) {
            console.log(`caught error creating/updating tables: ${e}`);
        }

        return db;
    }

    public async logTxn(e: UserEvent): Promise<boolean> {
        const query: string = await this.readSqlFromFile('insert_event.sql');

        const insertEvent = this.connection?.prepare(query);

        const result = insertEvent?.run(
            e.type,
            e.user_id,
            e.amount,
            e.t,
        );

        const lastRowExists: boolean = !!(result?.lastInsertRowid);
        return lastRowExists;
    }

    public async getPreviousTxnsForUser(user_id: number, limit: number): Promise<UserEvent[]> {
        const query: string = await this.readSqlFromFile('get_events_by_user_id.sql');

        const results = this.connection?.query(query).all(user_id, limit);

        let events: UserEvent[] = [];
        results?.forEach((dbRow: any) => {
            events.push({
                type: dbRow.type,
                amount: dbRow.amount,
                user_id: dbRow.user_id,
                t: dbRow.time,
            });
        });

        return events;
    }

    public async getPreviousTxnsForUserOfType(user_id: number, limit: number, type: string): Promise<UserEvent[]> {
        const query: string = await this.readSqlFromFile('get_events_by_user_id_and_type.sql');

        const results = this.connection?.query(query).all(user_id, type, limit);

        let events: UserEvent[] = [];
        results?.forEach((dbRow: any) => {
            events.push({
                type: dbRow.type,
                amount: dbRow.amount,
                user_id: dbRow.user_id,
                t: dbRow.time,
            });
        });

        return events;
    }

    public async getAlertableSingleWithdrawalAmount(): Promise<number> {
        return parseInt(await this.getConfig('alertable_single_withdrawal_amount'));
    }

    public async getAlertableShortTermAccumulativeAmount(): Promise<number> {
        return parseInt(await this.getConfig('alertable_cumulative_short_term_deposit_amount'));
    }

    public async getNumberOfAlertableConsecutiveWithdrawals(): Promise<number> {
        return parseInt(await this.getConfig('alertable_consecutive_withdrawals'));
    }

    public async getNumberOfAlertableConsecutiveIncreasingDeposits(): Promise<number> {
        return parseInt(await this.getConfig('alertable_consecutive_increasing_deposits'));
    }

    public async getNumberOfAlertableShortTermAccumulativeDeposits(): Promise<number> {
        return parseInt(await this.getConfig('alertable_cumulative_short_term_deposit_amount'));
    }

    private async getConfig(key: string): Promise<string> {
        const query: string = await this.readSqlFromFile('get_config_value.sql');

        const result: any = this.connection?.query(query).get(key);

        return result.value;
    }

    private readSqlFromFile(filename: string): Promise<string> {
        const queryFile: Bun.BunFile = Bun.file(`src/repositories/sql/${filename}`);

        return queryFile.text();
    }
}