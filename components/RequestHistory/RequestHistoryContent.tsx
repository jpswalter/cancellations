import { RequestChange } from '@/lib/db/schema';
import { getDisplayHeader } from '@/utils/template.utils';

export type ChangeGroup = {
  changedBy: string;
  tenantType: 'proxy' | 'provider';
  changes: RequestChange[];
};

export const groupChanges = (changes: RequestChange[]): ChangeGroup[] => {
  return changes.reduce((groups: ChangeGroup[], change) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.changedBy === change.changedBy.email) {
      lastGroup.changes.push(change);
    } else {
      groups.push({
        changedBy: change.changedBy.email,
        tenantType: change.changedBy.tenantType,
        changes: [change],
      });
    }
    return groups;
  }, []);
};

export const renderHistoryTitle = (group: ChangeGroup): string => {
  const { changedBy, changes } = group;
  const statusChange = changes.find(change => change.field === 'status');

  if (statusChange) {
    switch (statusChange.newValue) {
      case 'Save Offered':
        return `Save offer proposed by ${changedBy}`;
      case 'Save Confirmed':
        return `Save offer confirmed by ${changedBy}`;
      case 'Save Accepted':
        return `Save offer accepted by ${changedBy}`;
      case 'Save Declined':
        return `Save offer declined by ${changedBy}`;
    }
  }

  const isFirstChange =
    changes.length === 1 &&
    changes[0].field === 'status' &&
    changes[0].newValue === 'Pending';

  if (isFirstChange) {
    return `Request created by ${changedBy}`;
  }

  const declineReasonChange = changes.find(
    change => change.field === 'declineReason',
  );

  if (declineReasonChange) {
    if (
      declineReasonChange.oldValue === null &&
      declineReasonChange.newValue !== null
    ) {
      return `Request declined by ${changedBy}`;
    } else if (
      declineReasonChange.oldValue !== null &&
      declineReasonChange.newValue === null
    ) {
      return `Request issue resolved by ${changedBy}`;
    }
  }

  const successfullyResolvedChange = changes.find(
    change => change.field === 'successfullyResolved',
  );

  if (successfullyResolvedChange && successfullyResolvedChange.newValue) {
    return `Request successfully resolved by ${changedBy}`;
  }
  return `${changes.length} changes made by ${changedBy}`;
};

export const renderDescription = (
  changes: RequestChange[],
): React.ReactNode => {
  const saveOfferChangeTitle = changes.find(
    change => change.field === 'saveOffer.title',
  );

  if (saveOfferChangeTitle) {
    return <p>Offer: {saveOfferChangeTitle?.newValue}</p>;
  }

  const declineReasonChange = changes.find(
    change => change.field === 'declineReason',
  );
  if (declineReasonChange) {
    if (
      declineReasonChange.newValue === null &&
      declineReasonChange.oldValue !== null
    ) {
      const customerInfoChanges = changes.filter(change =>
        change.field.includes('customerInfo.'),
      );
      if (customerInfoChanges.length > 0) {
        const changedFields = customerInfoChanges
          .map(change => {
            const customerFieldChanged = change.field.split('.')[1];
            const newValue =
              typeof change.newValue === 'string' ? change.newValue : 'updated';
            return `${getDisplayHeader(customerFieldChanged)} changed from ${change.oldValue} to ${newValue}`;
          })
          .join(', ');
        return <p>{changedFields}</p>;
      }
    }
    return <p>Reason: {declineReasonChange.newValue}</p>;
  }

  return null;
};

const RequestHistoryContent: React.FC<{
  group: ChangeGroup;
}> = ({ group }) => {
  const changesExceptStatus = group.changes.filter(
    change => change.field !== 'status',
  );

  return (
    <div>
      <h4 className="font-bold">{renderHistoryTitle(group)}</h4>
      {renderDescription(changesExceptStatus)}
    </div>
  );
};

export default RequestHistoryContent;
