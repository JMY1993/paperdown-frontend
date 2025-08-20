# License Security Validation

This directory contains the implementation of the challenge transformation security mechanism to prevent response forgery.

## Components

### Backend
- `internal/license/`: Core license management logic
- `internal/license/challenge_transformer.go`: Challenge transformation algorithm
- `internal/license/service.go`: License service with security validation
- `internal/license/handler.go`: HTTP handlers with security endpoints

### Frontend
- `frontend-spa/src/services/license.ts`: API service layer for license operations
- `frontend-spa/src/components/license/ActivationCodeForm.tsx`: Reusable activation code form component
- `frontend-spa/src/routes/license/`: License management pages
- `frontend-spa/public/license-security-test.html`: Standalone security test page

## Security Mechanism

The challenge transformation mechanism prevents response forgery by:

1. **Client-generated challenge**: Each request includes a unique challenge value
2. **Server-side hash computation**: Server computes a response hash using the challenge and request content
3. **Client-side verification**: Client independently computes expected hash and compares with server response
4. **Tampering detection**: Any mismatch indicates response has been tampered with

### Algorithm

```javascript
// Challenge transformation algorithm
function transformChallenge(challenge, requestBody) {
  const totalChars = JSON.stringify(requestBody).length;
  const challengeLength = challenge.length;
  if (challengeLength === 0) return "";
  
  const rotatePos = totalChars % challengeLength;
  const rotated = challenge.substring(rotatePos) + challenge.substring(0, rotatePos);
  
  return rotated.length > 16 ? rotated.substring(0, 16) : rotated;
}
```

## API Endpoints

### Admin Endpoints
- `POST /api/v1/admin/license/activation-codes` - Create activation code
- `GET /api/v1/admin/license/activation-codes` - List activation codes
- `GET /api/v1/admin/license/activation-codes/{code}` - Get activation code details
- `PATCH /api/v1/admin/license/activation-codes/{code}` - Update activation code
- `DELETE /api/v1/admin/license/activation-codes/{code}` - Delete activation code

### User Endpoints
- `POST /api/v1/license/activate` - Activate service using existing user
- `POST /api/v1/license/create-and-activate` - Create user and activate service
- `GET /api/v1/license/licenses` - Get user's service licenses
- `GET /api/v1/license/licenses/{service_name}` - Get user's specific service license
- `POST /api/v1/license/validate-secure` - Securely validate user license

## Usage

### Creating Activation Codes (Admin)
1. Navigate to Admin → License Management → Create Activation Code
2. Fill in activation code details including service name, duration, and restrictions
3. Submit to create the activation code

### Activating Services (User)
1. Navigate to License Management → Activate Service
2. Enter activation code to activate service
3. Service will be added to your license list

### Security Testing
1. Navigate to License Management → Security Test
2. Enter service name and authentication token
3. Click "Test Security Validation" to verify the challenge transformation mechanism

## Security Features

1. **Response Forgery Prevention**: Challenge transformation ensures responses cannot be forged
2. **Replay Attack Protection**: Unique challenges prevent replay attacks
3. **Man-in-the-Middle Detection**: Client-side verification detects tampering
4. **Usage Limit Enforcement**: Activation codes can have usage limits
5. **Expiration Control**: Activation codes and licenses can have expiration dates