import {UserEvent} from "../types";
import * as mongoose from "mongoose";

// Define interface for the repo
interface IUserFinanceRepository {
    logEvent(e: UserEvent): void;
    getAlertableSingleWithdrawalAmount(): number;
    getNumberOfAlertableConsecutiveWithdrawals(): number;
}

export class FinanceRepository implements IUserFinanceRepository {
    private static instance: FinanceRepository;
    private connection: any;

    private constructor() {
        this.connection = this.createConnection();
    }

    public static getInstance(): FinanceRepository {
        if (!FinanceRepository.instance) {
            FinanceRepository.instance = new FinanceRepository();
        }
        return FinanceRepository.instance;
    }

    private async createConnection() {
        // Connection logic here
        const mongoHost: string = process.env.MONGO_DB_URL as string;
        const mongoPort: number = parseInt(process.env.MONGO_DB_PORT as string);
        const connectionString: string = `mongodb://${mongoHost}:${mongoPort}/activityMon`;

        console.log(`financeRepository: connection string built ${connectionString}`);

        this.connection = await mongoose.connect(connectionString);

        console.log('financeRepository: connected to mongodb');

        return { connected: true };
    }

    public logEvent(e: UserEvent): void {
        //
    }

    public getAlertableSingleWithdrawalAmount(): number {
        return 100;
    }

    public getNumberOfAlertableConsecutiveWithdrawals(): number {
        return 3;
    }
}