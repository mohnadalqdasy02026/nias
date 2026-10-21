import { useAuth } from '../../contexts/auth.jsx';

// Renders its children only when the signed-in account holds the permission.
// Buttons for sections someone cannot use are hidden instead of shown and
// then rejected by the API.
export default function Can({ perm, anyOf, children, fallback = null }) {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  if (Array.isArray(anyOf) && anyOf.length) {
    return anyOf.some((p) => permissions.includes(p)) ? children : fallback;
  }
  if (!perm) return children;
  return permissions.includes(perm) ? children : fallback;
}
