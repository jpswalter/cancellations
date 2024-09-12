import { useMemo } from 'react';
import { TenantType } from '@/lib/db/schema';
import { FaCog } from 'react-icons/fa';
import { FaChartSimple, FaFileCsv } from 'react-icons/fa6';
import { BsListUl } from 'react-icons/bs';
import {
  MdOutlineAssignmentTurnedIn,
  MdNotificationsActive,
} from 'react-icons/md';
import { IconType } from 'react-icons';
import { IoBusinessOutline } from 'react-icons/io5';

interface MenuItem {
  link: string;
  label: string;
  Icon: IconType;
}

export const useMenuItems = (
  tenantType: TenantType | undefined,
): {
  mainItems: MenuItem[];
  settingsItem: MenuItem;
} => {
  return useMemo(() => {
    if (!tenantType) {
      return {
        mainItems: [],
        settingsItem: {
          link: '/settings',
          label: 'Settings',
          Icon: FaCog,
        },
      };
    }

    const settingsItem: MenuItem = {
      link: '/settings',
      label: 'Settings',
      Icon: FaCog,
    };

    const tenantSpecificItems: Record<TenantType, MenuItem[]> = {
      provider: [
        { link: '/overview', label: 'Overview', Icon: FaChartSimple },
        {
          link: '/actions',
          label: 'Actions Needed',
          Icon: MdNotificationsActive,
        },
        { link: '/requests', label: 'All Requests', Icon: BsListUl },
      ],
      proxy: [
        {
          link: '/actions',
          label: 'Actions Needed',
          Icon: MdNotificationsActive,
        },
        {
          link: '/resolved',
          label: 'Resolved',
          Icon: MdOutlineAssignmentTurnedIn,
        },
        { link: '/requests', label: 'All Requests', Icon: BsListUl },
        { link: '/upload', label: 'Upload CSV', Icon: FaFileCsv },
      ],
      management: [
        {
          link: '/organizations',
          label: 'Organizations',
          Icon: IoBusinessOutline,
        },
      ],
    };

    return {
      mainItems: tenantSpecificItems[tenantType],
      settingsItem,
    };
  }, [tenantType]);
};
