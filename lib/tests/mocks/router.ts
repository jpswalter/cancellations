type MockRouterOptions = {
  currrentPath?: string;
  onPush?: jest.Mock;
  onReplace?: jest.Mock;
};

// Create a mock for the NextRouter object
export const createMockRouter = ({
  currrentPath = '/',
  onPush,
  onReplace,
}: MockRouterOptions = {}) => ({
  pathname: currrentPath,
  query: {},
  asPath: currrentPath,
  push: onPush,
  replace: onReplace,
  reload: jest.fn(),
  back: jest.fn(),
  beforePopState: jest.fn(),
  prefetch: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isPreview: false,
  isReady: true,
});
