import {UserEvent} from "../types";
import {WithdrawEventType} from "../config/constants";
import {FinanceRepository} from "../repositories/financeRepository";
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
    const triggerAmount: number = await dbRepo.getAlertableSingleWithdrawalAmount();
    if (userEvent.type === WithdrawEventType && userEvent.amount > triggerAmount) {
        ueResolution.alert_codes.push(alertCodes.maxSingleWithdrawal);
    }

    // `x` amount of consecutive withdrawals
    const maxConsecutiveWithdrawals: number = await dbRepo.getNumberOfAlertableConsecutiveWithdrawals();
    const previousUserTransactions: any[] = await dbRepo.getPreviousTxnsForUser(userEvent.user_id, maxConsecutiveWithdrawals);
    const prevThreeWereWithdrawals: boolean = previousUserTransactions.every((txn: any) => {
        return txn.type === WithdrawEventType;
    });
    if (userEvent.type === WithdrawEventType && prevThreeWereWithdrawals && previousUserTransactions.length === maxConsecutiveWithdrawals) {
        ueResolution.alert_codes.push(alertCodes.consecutiveWithdrawals);
    }

    // `x` consecutive increasing deposits
    // TODO

    // Set the alert on the resolution depending on if there's alert codes
    if (ueResolution.alert_codes.length !== 0) {
        ueResolution.alert = true;
    }

    // Return the resolution
    return ueResolution;
};