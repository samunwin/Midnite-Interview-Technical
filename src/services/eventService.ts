import {UserEvent} from "../types";
import {DepositEventType, WithdrawEventType} from "../config/constants";
import {FinanceRepository, IUserFinanceRepository} from "../repositories/financeRepository";
import {use} from "hono/dist/types/jsx";
import {maximum} from "zod/v4-mini";

export type UserEventResolution = {
    alert: boolean;
    alert_codes: number[];
    user_id: number;
};

const alertCodes = {
    maxSingleWithdrawal: 1100,
    consecutiveWithdrawals: 30,
    consecutiveIncreasingDeposits: 300,
    accumulativeDepositAmount: 123,
};

export const handleUserEvent = async (userEvent: UserEvent): Promise<UserEventResolution> => {
    // should pass this in so i can mock it
    const dbRepo: FinanceRepository = FinanceRepository.getInstance();

    // Log the event first
    dbRepo.logTxn(userEvent).then((ok: boolean) => {
        if (!ok) {
            console.log('error logging event to db');
        }
    });

    // Create where we're going to store the resolution for this event
    let ueResolution: UserEventResolution = {
      alert: false,
      alert_codes: [],
      user_id: userEvent.user_id,
    };

    // Withdrawal amount over the maximum allowed in single withdrawal
    if (await withdrawalOverAllowedInSingleTransaction(dbRepo, userEvent)) {
        ueResolution.alert_codes.push(alertCodes.maxSingleWithdrawal);
    }

    // `x` amount of consecutive withdrawals
    if (await previousUserWithdrawalsAreConsecutive(dbRepo, userEvent)) {
        ueResolution.alert_codes.push(alertCodes.consecutiveWithdrawals);
    }

    // `x` consecutive increasing deposits
    if (await previousUserDepositsIncreasing(dbRepo, userEvent)) {
        ueResolution.alert_codes.push(alertCodes.consecutiveIncreasingDeposits);
    }

    // accumulative deposit amount over `x` over 30 seconds
    if (await accumulativeDepositsOverThreshold(dbRepo, userEvent)) {
        ueResolution.alert_codes.push(alertCodes.accumulativeDepositAmount);
    }

    // Set the alert on the resolution depending on if there's alert codes
    if (ueResolution.alert_codes.length !== 0) {
        ueResolution.alert = true;
    }

    // Return the resolution
    return ueResolution;
};

const withdrawalOverAllowedInSingleTransaction = async (dbRepo: IUserFinanceRepository, userEvent: UserEvent): Promise<boolean> => {
    const triggerAmount: number = await dbRepo.getAlertableSingleWithdrawalAmount();
    if (userEvent.type === WithdrawEventType && userEvent.amount > triggerAmount) {
        return true;
    }

    return false;
};

const previousUserWithdrawalsAreConsecutive = async(dbRepo: IUserFinanceRepository, userEvent: UserEvent): Promise<boolean> => {
    const maxConsecutiveWithdrawals: number = await dbRepo.getNumberOfAlertableConsecutiveWithdrawals();
    const previousUserTransactions: any[] = await dbRepo.getPreviousTxnsForUser(userEvent.user_id, maxConsecutiveWithdrawals);
    const prevThreeWereWithdrawals: boolean = previousUserTransactions.every((txn: any) => {
        return txn.type === WithdrawEventType;
    });

    if (userEvent.type === WithdrawEventType && prevThreeWereWithdrawals && previousUserTransactions.length === maxConsecutiveWithdrawals) {
        return true;
    }

    return false;
};

const previousUserDepositsIncreasing = async (dbRepo : IUserFinanceRepository, userEvent: UserEvent): Promise<boolean> => {
    const maxConsecutiveIncreasingDeposits: number = await dbRepo.getNumberOfAlertableConsecutiveIncreasingDeposits();
    const previousUserDepositTransactions: any[] = await dbRepo.getPreviousTxnsForUserOfType(userEvent.user_id, maxConsecutiveIncreasingDeposits, DepositEventType);

    if (maxConsecutiveIncreasingDeposits !== previousUserDepositTransactions.length) {
        return false;
    }

    const areIncreasing: boolean = previousUserDepositTransactions.every((item: any, i: number, array: any[]) => i === 0 || item.amount > array[i - 1].amount);
    return areIncreasing;
};

const accumulativeDepositsOverThreshold = async (dbRepo: IUserFinanceRepository, userEvent: UserEvent): Promise<boolean> => {
    const numberOfRecentDepositsThreshold: number = await dbRepo.getNumberOfAlertableShortTermAccumulativeDeposits();
    const previousUserTransactions: any[] = await dbRepo.getPreviousTxnsForUser(userEvent.user_id, numberOfRecentDepositsThreshold);

    const sum: number = previousUserTransactions.reduce((acc, curr) => acc + curr.amount);
    const cumulativeDepositThreshold: number = await dbRepo.getAlertableShortTermAccumulativeAmount();

    return sum > cumulativeDepositThreshold;
};
