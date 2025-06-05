import {UserEvent} from "../types";
import {Database} from "bun:sqlite";

// Define interface for the repo
interface IUserFinanceRepository {
    logEvent(e: UserEvent): void;
    getAlertableSingleWithdrawalAmount(): number;
    getNumberOfAlertableConsecutiveWithdrawals(): number;
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
        // Connection logic here
        const db: Database = new Database("src/db.sqlite", { create: true });

        const createTablesQuery: string = await this.readSqlFromFile('create_tables.sql');

        db.query(createTablesQuery).run();

        return db;
    }

    public async logEvent(e: UserEvent): Promise<void> {
        const query: string = await this.readSqlFromFile('insert_event.sql');

        const insertEvent = this.connection?.prepare(query);

        const result = insertEvent?.run(
            e.type,
            e.user_id,
            e.amount,
            e.t,
        );

        console.log(result?.lastInsertRowid);
    }

    public getAlertableSingleWithdrawalAmount(): number {
        return 100;
    }

    public getNumberOfAlertableConsecutiveWithdrawals(): number {
        return 3;
    }

    private readSqlFromFile(filename: string): Promise<string> {
        const queryFile: Bun.BunFile = Bun.file(`src/repositories/sql/${filename}`);

        return queryFile.text();
    }
}