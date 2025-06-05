import {UserEvent} from "../types";
import {WithdrawEventType} from "../config/constants";
import {FinanceRepository} from "../repositories/financeRepository";
import event from "../controllers/event";

export type UserEventResolution = {
    alert: boolean;
    alert_codes: number[];
    user_id: number;
};

const alertCodes = {
    maxSingleWithdrawal: 100,
    consecutiveWithdrawals: 30,
    consecutiveIncreasingDeposits: 300,
    accumulativeDepositAmount: 123,
};

export const handleUserEvent = (userEvent: UserEvent): UserEventResolution => {

    // Create where we're going to store the resolution for this event
    let ueResolution: UserEventResolution = {
      alert: false,
      alert_codes: [],
      user_id: userEvent.user_id,
    };

    const dbRepo: FinanceRepository = FinanceRepository.getInstance();

    // Withdrawal amount over the maximum allowed in single withdrawal
    if (userEvent.type === WithdrawEventType && userEvent.amount > dbRepo.getAlertableSingleWithdrawalAmount()) {
        ueResolution.alert_codes.push(alertCodes.maxSingleWithdrawal);
    }

    // `x` amount of consecutive withdrawals
    // if (userEvent.type === WithdrawEventType)


    // Log the event
    dbRepo.logEvent(userEvent);

    // Return the resolution
    return ueResolution;
};