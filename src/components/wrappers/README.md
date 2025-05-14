# RouteGuard Component

The `RouteGuard` component is a unified wrapper that replaces the individual role-based wrappers (AdminWrapper, DoctorWrapper, etc.) and provides a single, consistent way to handle authentication and role-based routing in the application.

## Usage Examples

### Admin Routes

For pages that should only be accessible to administrators (role = 1):

```jsx
import { RouteGuard } from '@/components/wrappers';

export default function AdminPage() {
  return (
    <RouteGuard allowedRoles={[1]}>
      {/* Your admin page content */}
    </RouteGuard>
  );
}
```

### Doctor Routes

For pages that should only be accessible to doctors (role = 2):

```jsx
import { RouteGuard } from '@/components/wrappers';

export default function DoctorPage() {
  return (
    <RouteGuard allowedRoles={[2]}>
      {/* Your doctor page content */}
    </RouteGuard>
  );
}
```

### Patient Routes

For pages that should only be accessible to patients (role = 3):

```jsx
import { RouteGuard } from '@/components/wrappers';

export default function PatientPage() {
  return (
    <RouteGuard allowedRoles={[3]}>
      {/* Your patient page content */}
    </RouteGuard>
  );
}
```

### Multiple Roles

For pages that should be accessible to multiple roles:

```jsx
import { RouteGuard } from '@/components/wrappers';

export default function SharedPage() {
  return (
    <RouteGuard allowedRoles={[1, 2]}>
      {/* Content accessible to both admins and doctors */}
    </RouteGuard>
  );
}
```

### Any Authenticated User

For pages that should be accessible to any logged-in user:

```jsx
import { RouteGuard } from '@/components/wrappers';

export default function AuthenticatedPage() {
  return (
    <RouteGuard allowedRoles={[]}>
      {/* Content for any authenticated user */}
    </RouteGuard>
  );
}
```

### Guest-Only Routes

For pages that should only be accessible to guests (not logged in):

```jsx
import { RouteGuard } from '@/components/wrappers';

export default function LoginPage() {
  return (
    <RouteGuard allowedRoles={null}>
      {/* Login form or other guest-only content */}
    </RouteGuard>
  );
}
```

### Public Routes

For pages that should be accessible to everyone:

```jsx
import { RouteGuard } from '@/components/wrappers';

export default function PublicPage() {
  return (
    <RouteGuard>
      {/* Public content */}
    </RouteGuard>
  );
}
```

## Custom Redirect Paths

You can customize where users are redirected if they don't have access:

```jsx
import { RouteGuard } from '@/components/wrappers';

export default function CustomRedirectPage() {
  return (
    <RouteGuard 
      allowedRoles={[1]} 
      fallbackRoute="/custom-access-denied"
      loginRoute="/custom-login"
    >
      {/* Protected content */}
    </RouteGuard>
  );
}
``` 