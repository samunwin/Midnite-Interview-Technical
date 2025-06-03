
// Define interface
import {UserEvent} from "../types";

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

    private createConnection() {
        // Connection logic here
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