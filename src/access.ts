/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: {
  currentUser?: API.CurrentUser | undefined;
}) {
  const { currentUser } = initialState || {};

  console.log();
  return {
    canAdmin: currentUser && currentUser.depts[0].access === "SUPER_ADMIN",
    // canAdmin: true,
  };
}
