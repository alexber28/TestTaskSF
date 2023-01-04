public inherited sharing class ServiceCaseQueueService {
    @AuraEnabled(cacheable=true)
    public static List<Case> getUserCases() {
        List<Case> cases = [
            SELECT CaseNumber, OwnerId, Status, Priority, Origin, CreatedDate
            FROM Case
            ORDER BY OwnerId, Priority ASC, CreatedDate DESC
            LIMIT 25
        ];
        return cases;
    }
}