public without sharing class AccountCasesPdfCtrl {

    public static List<Case> getAccountCasesPrevWeek() { 
        List<Case> results = [
            SELECT CaseNumber, Status, Priority, Origin, CreatedDate, Account.Owner.Name, Account.Name
            FROM Case
            WHERE (CreatedDate = LAST_WEEK)
            ORDER BY Account.Name
        ];

        return results;
    }
}