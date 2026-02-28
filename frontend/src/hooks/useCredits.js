import useAuthStore from '../store/authStore';

const useCredits = () => {
  const { user, updateCredits } = useAuthStore();

  const balance = user?.creditAccount?.balance ?? 0;
  const total   = user?.subscription?.plan?.monthlyCredits ?? 5;
  const percent = Math.min((balance / total) * 100, 100);
  const hasCredits = balance > 0;

  return { balance, total, percent, hasCredits, updateCredits };
};

export default useCredits;