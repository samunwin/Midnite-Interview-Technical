import {UserEvent} from "../types";
import {Database} from "bun:sqlite";

// Define interface for the repo
interface IUserFinanceRepository {
    logTxn(e: UserEvent): void;
    getPreviousTxnsForUser(user_id: number, limit: number): Promise<UserEvent[]>;
    getAlertableSingleWithdrawalAmount(): Promise<number>;
    getNumberOfAlertableConsecutiveWithdrawals(): Promise<number>;
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

        console.log(e.type);
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

    public async getAlertableSingleWithdrawalAmount(): Promise<number> {
        const key: string = 'alertable_single_withdrawal_amount';

        const query: string = await this.readSqlFromFile('get_config_value.sql');

        const result: any = this.connection?.query(query).get(key);

        return result.value;
    }

    public async getNumberOfAlertableConsecutiveWithdrawals(): Promise<number> {
        return 3;
    }

    private readSqlFromFile(filename: string): Promise<string> {
        const queryFile: Bun.BunFile = Bun.file(`src/repositories/sql/${filename}`);

        return queryFile.text();
    }
}