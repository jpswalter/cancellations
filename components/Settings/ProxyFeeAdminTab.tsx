import { FC, useState } from 'react';
import { Text } from '@/components/ui/text';
import { Switch } from '@tremor/react';

const ProxyFeeAdminTab: FC = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const handleSwitchChange = () => {
    setIsSwitchOn(!isSwitchOn);
  };

  return (
    <div className="h-full py-8">
      <Text className="max-w-prose">
        Proxies often cause contact centers to incur additional processing
        costs. Therefore, if you choose, you can require proxies to pay “Proxy
        Fees” for each transaction your contact center processes for them.
        However, we prohibit using this platform for charging Proxy Fees for
        canceling subscriptions that were initiated through the contact center.
        For example, if a consumer, initiated a subscription through calling
        customer support, then you cannot charge a Proxy Fee for canceling that
        subscription. But you are permitted to charge Proxy Fees for processing
        cancellations for subscriptions the consumer originally signed up for
        through self service (e.g. on your website or app). Therefore, only
        enable Proxy Fees if you have policies and procedures in place that
        ensure all the subscriptions being canceled by proxies were originally
        signed up for by the customer through self-service. Two-thirds of the
        Proxy Fee is paid to your company every Wednesday (unless it is a bank
        holiday, in which case it will be the next day banks are open). The
        remaining one-third of the Proxy Fee is retained by ProxyLink as a
        transaction fee.
      </Text>
      <hr className="my-4" />
      <Text className="font-bold">Proxy Fees</Text>
      <div className="flex items-center gap-x-2 w-fit">
        <Text className="whitespace-nowrap">Fee per transaction</Text>
        <input
          className="w-24 h-18 text-sm border rounded-lg border-gray-400"
          type="number"
          step={0.01}
          defaultValue={0.75}
        />
      </div>
      <div className="flex items-center gap-x-2 w-fit mt-2">
        {isSwitchOn ? (
          <span className="text-green-600">Enabled</span>
        ) : (
          <span className="text-gray-400">Disabled</span>
        )}
        <Switch
          id="switch"
          name="switch"
          checked={isSwitchOn}
          onChange={handleSwitchChange}
          color="green"
        />
      </div>
    </div>
  );
};

export default ProxyFeeAdminTab;
