# Challenge #1: Bulk “Mark as reviewed” is slow
### Performance + UI/UX improvements:
- Previously, bulk updating transactions involved [calling Prisma’s `update()` function inside of a for-loop](https://github.com/JonSchwartz93/interview-assessment/blob/main/src/app/api/transactions/bulk/route.ts#L21). This meant that when you click "Mark # Reviewed", we would then individually update the transactions by `transactionId` which made for a super laggy, slow user experience. Instead, we can leverage Prisma’s `updateMany()` function to update the DB in one-shot vs. one time/`transactionId`
- We are still fetching all transaction on initial page-load, but to improve the overall frontend user experience, I've added client-side pagination so that you are able to view 20 transactions at a time. Additionally, you can only update those 20 transactions which avoids the incredibly slow page update when trying to update all transactions. 
- Calculate "stats" on the backend and return them with the ``GET api/transactions?caseId=[caseId]` call
- Improve checkbox state updating and allow users to select anywhere within a row to update the checkbox and mark a transaction as "selected"

###  Future improvements:
- Add caching to `GET api/transactions?caseId=[caseId]` so that we don't refetch when switching cases
- Add support for query params for `status`, `category`, `search`
- Add a "stats" endpoint to decouple calculating the stats from the `GET api/transactions?caseId=[caseId]` endpoint

# Challenge #2: Order processing workflow is failing frequently

### After investigating _why_ workflows kept failing, I identified 3 core issues:

1. Incorrect payment logic in the `Process Payment` step - when a payment result would return successfully, we were still returning a failure. We just needed to reverse the logic.
2. No api retry logic in the `Check Inventory` step - when `simulateExternalInventoryService()` fails, we weren't retrying. In order to resolve this, I added a `withRetry()` util to allowing us to re-attempt the `Check Inventory` step multiple times before failing.
3. `Send Notification` failures resulting in the entire order failing - instead of failing the entire order when the 'Send Notification' step fails, we instead still return a "success" here, but include the `notificationResult.error` in the response. Although sending notifications to users is crucial, it shouldn't block the entire order from completing successfully. In the future, I would recommend adding retry logic to this step.
