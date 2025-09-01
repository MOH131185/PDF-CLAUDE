# Deployment Guide

This guide covers deploying the PDF Tools application across web, iOS, and Android platforms.

## Prerequisites

### Web Application
- Vercel account
- Environment variables configured
- Domain configured (www.pdftools.com)

### Mobile Applications
- Expo account with EAS Build access
- Apple Developer Account (for iOS)
- Google Play Developer Account (for Android)
- GitHub Actions configured with secrets

## Environment Variables

### Shared Variables
Create a `.env` file in the root directory:
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=https://api.pdftools.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Mobile-Specific Variables
Add to `packages/mobile/app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

## Web Application Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set the root directory to `packages/web`
3. Configure build settings:
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm ci
   ```
4. Add environment variables in Vercel dashboard
5. Deploy and configure custom domain

### Manual Deployment
```bash
# Build and deploy web app
cd packages/web
npm run build
npm run deploy
```

## Mobile Application Deployment

### Initial Setup

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/cli eas-cli
   ```

2. **Login to Expo**
   ```bash
   cd packages/mobile
   eas login
   ```

3. **Configure EAS Project**
   ```bash
   eas build:configure
   ```

### iOS Deployment

#### Prerequisites
- Apple Developer Account ($99/year)
- App Store Connect access
- iOS Distribution Certificate
- App Store Provisioning Profile

#### Steps
1. **Configure iOS app in App Store Connect**
   - Create new app with bundle ID: `com.pdftools.mobile`
   - Upload app icon and screenshots
   - Fill in app metadata from `store.config.js`

2. **Build for iOS**
   ```bash
   cd packages/mobile
   eas build --platform ios --profile production
   ```

3. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

#### App Store Connect Configuration
- **App Name**: PDF Tools
- **Bundle ID**: com.pdftools.mobile
- **Category**: Productivity
- **Keywords**: PDF, merge, split, compress, documents, productivity
- **Description**: Use the description from `store.config.js`
- **Screenshots**: Upload screenshots from the specified directories
- **Privacy Policy**: https://www.pdftools.com/privacy
- **Support URL**: https://www.pdftools.com/support

### Android Deployment

#### Prerequisites
- Google Play Console account ($25 one-time fee)
- Google Play Console API access
- Service Account JSON key

#### Steps
1. **Configure Android app in Google Play Console**
   - Create new app with package name: `com.pdftools.mobile`
   - Upload app icon and screenshots
   - Fill in store listing from `store.config.js`

2. **Build for Android**
   ```bash
   cd packages/mobile
   eas build --platform android --profile production
   ```

3. **Submit to Google Play**
   ```bash
   eas submit --platform android
   ```

#### Google Play Console Configuration
- **App Name**: PDF Tools - Merge, Split & Compress
- **Package Name**: com.pdftools.mobile
- **Category**: Productivity
- **Target Audience**: Everyone
- **Description**: Use the fullDescription from `store.config.js`
- **Screenshots**: Upload screenshots from the specified directories
- **Privacy Policy**: https://www.pdftools.com/privacy
- **Website**: https://www.pdftools.com

## Automated Deployment

### GitHub Actions Setup

1. **Configure Repository Secrets**
   ```
   EXPO_TOKEN - Expo access token
   EXPO_APPLE_APP_SPECIFIC_PASSWORD - Apple app-specific password
   ```

2. **Workflow Triggers**
   - Automatic builds on push to main branch
   - Manual deployment triggers
   - PR validation builds

### Build Profiles

#### Development
```bash
eas build --profile development --platform all
```

#### Preview (Internal Testing)
```bash
eas build --profile preview --platform all
```

#### Production
```bash
eas build --profile production --platform all
```

## Testing

### Web Application
```bash
cd packages/web
npm run test
npm run build
npm run start
```

### Mobile Application
```bash
cd packages/mobile
npm run test
npm run type-check
npm run lint
```

### End-to-End Testing
- Test cross-platform authentication
- Verify PDF processing on all platforms
- Test QR code functionality
- Validate app store download links

## Monitoring

### Web Analytics
- Google Analytics 4 configured
- Conversion tracking for sign-ups and upgrades
- Error tracking and performance monitoring

### Mobile Analytics
- Expo Analytics for crash reporting
- Custom events for PDF operations
- User engagement metrics

### Error Tracking
- Sentry integration for error monitoring
- Performance monitoring across platforms
- User feedback collection

## Rollback Procedures

### Web Application
1. Revert to previous deployment in Vercel
2. Update DNS if necessary
3. Monitor error rates and user feedback

### Mobile Applications
1. **iOS**: Use App Store Connect to stop release
2. **Android**: Use Play Console to halt rollout
3. Submit hotfix builds if necessary
4. Communicate with users through app store descriptions

## Security Considerations

### API Keys
- Never commit sensitive keys to repository
- Use environment variables for all configurations
- Rotate keys regularly
- Use different keys for development and production

### App Store Security
- Enable two-factor authentication on developer accounts
- Use strong, unique passwords
- Regularly review account access
- Monitor for unauthorized changes

### Data Protection
- All PDF processing happens locally or on secure servers
- No sensitive user data stored in logs
- GDPR and privacy regulation compliance
- Regular security audits

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Clear npm cache and reinstall dependencies
- Verify environment variables are set
- Check for TypeScript errors

#### Submission Failures
- Verify app store guidelines compliance
- Check metadata and screenshots
- Ensure proper signing certificates
- Validate app functionality

#### Performance Issues
- Monitor bundle sizes
- Optimize images and assets
- Review third-party dependencies
- Implement code splitting where appropriate

### Support Contacts
- **Expo Support**: https://expo.dev/support
- **Apple Developer Support**: https://developer.apple.com/support/
- **Google Play Support**: https://support.google.com/googleplay/android-developer/
- **Vercel Support**: https://vercel.com/help