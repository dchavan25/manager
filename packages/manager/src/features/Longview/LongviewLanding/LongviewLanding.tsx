import {
  getActiveLongviewPlan,
  getLongviewSubscriptions,
} from '@linode/api-v4/lib/longview';
import { styled } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { matchPath } from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import withLongviewClients from 'src/containers/longview.container';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useAccountSettings } from 'src/queries/account/settings';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getRestrictedResourceText } from 'src/features/Account/utils';

import { SubscriptionDialog } from './SubscriptionDialog';

import type {
  ActiveLongviewPlan,
  LongviewSubscription,
} from '@linode/api-v4/lib/longview/types';
import type { RouteComponentProps } from 'react-router-dom';
import type { Props as LongviewProps } from 'src/containers/longview.container';

const LongviewClients = React.lazy(() => import('./LongviewClients'));
const LongviewPlans = React.lazy(() => import('./LongviewPlans'));

interface LongviewLandingProps extends LongviewProps, RouteComponentProps<{}> {}

export const LongviewLanding = (props: LongviewLandingProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const activeSubscriptionRequestHook = useAPIRequest<ActiveLongviewPlan>(
    () => getActiveLongviewPlan().then((response) => response),
    {}
  );
  const subscriptionsRequestHook = useAPIRequest<LongviewSubscription[]>(
    () => getLongviewSubscriptions().then((response) => response.data),
    []
  );

  const { createLongviewClient } = props;

  const { data: accountSettings } = useAccountSettings();

  const isManaged = Boolean(accountSettings?.managed);

  const [newClientLoading, setNewClientLoading] = React.useState<boolean>(
    false
  );
  const [
    subscriptionDialogOpen,
    setSubscriptionDialogOpen,
  ] = React.useState<boolean>(false);

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      routeName: `${props.match.url}/clients`,
      title: 'Clients',
    },
    {
      routeName: `${props.match.url}/plan-details`,
      title: 'Plan Details',
    },
  ];

  const isLongviewCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_longview',
  });

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  const handleAddClient = () => {
    setNewClientLoading(true);
    createLongviewClient()
      .then((_) => {
        setNewClientLoading(false);
        if (props.history.location.pathname !== '/longview/clients') {
          props.history.push('/longview/clients');
        }
      })
      .catch((errorResponse) => {
        if (errorResponse[0].reason.match(/subscription/)) {
          // The user has reached their subscription limit.
          setSubscriptionDialogOpen(true);
        } else {
          // Any network or other errors handled with a toast
          enqueueSnackbar(
            getAPIErrorOrDefault(
              errorResponse,
              'Error creating Longview client.'
            )[0].reason,
            { variant: 'error' }
          );
          setNewClientLoading(false);
        }
      });
  };

  const handleSubmit = () => {
    const {
      history: { push },
    } = props;

    if (isManaged) {
      push({
        pathname: '/support/tickets',
        state: {
          open: true,
          title: 'Request for additional Longview clients',
        },
      });
      return;
    }
    props.history.push('/longview/plan-details');
  };

  return (
    <>
      <LandingHeader
        createButtonText="Add Client"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-longview"
        entity="Client"
        loading={newClientLoading}
        onButtonClick={handleAddClient}
        removeCrumbX={1}
        title="Longview"
        disabledCreateButton={isLongviewCreationRestricted}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Longview Clients',
          }),
        }}
      />
      <StyledTabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <LongviewClients
                activeSubscription={activeSubscriptionRequestHook.data}
                handleAddClient={handleAddClient}
                newClientLoading={newClientLoading}
                {...props}
              />
            </SafeTabPanel>

            <SafeTabPanel index={1}>
              <LongviewPlans
                subscriptionRequestHook={subscriptionsRequestHook}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </StyledTabs>
      <SubscriptionDialog
        clientLimit={
          isEmpty(activeSubscriptionRequestHook.data)
            ? 10
            : (activeSubscriptionRequestHook.data as LongviewSubscription)
                .clients_included
        }
        isManaged={isManaged}
        isOpen={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

const StyledTabs = styled(Tabs, {
  label: 'StyledTabs',
})(() => ({
  marginTop: 0,
}));

export const longviewLandingLazyRoute = createLazyRoute('/longview')({
  component: LongviewLanding,
});

export default withLongviewClients()(LongviewLanding);
