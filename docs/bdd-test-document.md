# 🧪 Behavior-Driven Test Document for LocalWebsiteAudit.ca

## Table of Contents
- [Core Feature Testing](#core-feature-testing)
  - [Website Audit Feature](#website-audit-feature)
  - [Petition Feature](#petition-feature)
  - [Signup Feature](#signup-feature)
  - [Tools Directory](#tools-directory)
- [Component Testing](#component-testing)
- [Routing Tests](#routing-tests)
- [API Integration Tests](#api-integration-tests)
- [Supabase Integration Tests](#supabase-integration-tests)
- [Edge Cases & Error Handling](#edge-cases--error-handling)
- [Accessibility Testing](#accessibility-testing)
- [Performance Testing](#performance-testing)

---

## Core Feature Testing

### Website Audit Feature

#### Happy Path: User views a business audit page

```gherkin
FEATURE: Business Audit Page
  AS A potential client
  I WANT to view a comprehensive audit of a local business website
  SO THAT I can understand the website's performance issues

  Scenario: User visits a valid business audit page
    Given the user navigates to "/{validBusinessSlug}"
    When the page loads
    Then the user should see a loading skeleton
    And the API should be called with the correct business slug
    And upon successful data fetch, the loading skeleton should be replaced with audit data
    And the audit data should contain sections for:
      | SEO analysis         |
      | Performance metrics  |
      | Mobile compatibility |
      | User experience      |
      | Technical issues     |
    And each section should show a score/rating
    And each section should contain specific actionable recommendations
    And the page should display the business name and logo
    And a call-to-action button should be visible
```

#### Error Path: Invalid or missing business

```gherkin
  Scenario: User visits a non-existent business audit page
    Given the user navigates to "/{invalidBusinessSlug}"
    When Supabase query returns no results
    Then the loading skeleton should be replaced with an error message
    And the error message should suggest searching for a different business
    And a search input field should be displayed
    And suggested businesses may be shown if available

  Scenario: Database failure while fetching audit data
    Given the user navigates to "/{validBusinessSlug}"
    When the Supabase client encounters an error
    Then an error toast notification should appear
    And a retry button should be displayed
    And error details should be logged (but not shown to user)
    And a fallback UI should be shown with contact information
```

### Petition Feature

#### Happy Path: User signs a petition

```gherkin
FEATURE: Business Support Petition
  AS A customer of a local business
  I WANT to sign a petition supporting their website improvement
  SO THAT I can help the business understand the importance of their online presence

  Scenario: User successfully signs a petition
    Given the user navigates to "/petition/{validSlug}"
    When the petition page loads
    Then the user should see the business name and petition description
    And a form with fields for:
      | Name (required)        |
      | Email (required)       |
      | Comment (optional)     |
      | Rating (optional)      |
    When the user fills all required fields with valid data
    And submits the form
    Then a success message should appear
    And the petition counter should increment
    And a share button/link should be displayed
    And the user's submission should appear in the list of supporters
```

#### Error Path: Form validation issues

```gherkin
  Scenario: User submits the petition form with invalid data
    Given the user is on the petition page
    When the user submits the form with:
      | Name: "" (empty)             |
      | Email: "notavalidemail"      |
    Then validation errors should appear under each invalid field
    And the form should not be submitted
    And the focus should be set to the first invalid field
    
  Scenario: Database failure during petition submission
    Given the user has filled the petition form with valid data
    When the form is submitted
    And the Supabase insert operation fails
    Then an error toast notification should appear
    And the form should remain filled with user data
    And a retry button should be displayed
```

### Signup Feature

#### Happy Path: User signs up for updates

```gherkin
FEATURE: Email/SMS Signup
  AS A interested visitor
  I WANT to sign up for updates
  SO THAT I can stay informed about the service

  Scenario: User successfully signs up with email
    Given the user navigates to "/signup"
    When the signup page loads
    Then the user should see a form with:
      | Email (required)       |
      | Name (optional)        |
      | Preference toggles     |
    When the user enters a valid email
    And submits the form
    Then a success message should appear
    And a confirmation email should be sent (verified via logs)
    And the user should be redirected to a thank you page

  Scenario: User successfully signs up with SMS
    Given the user navigates to "/signup"
    When the user selects the SMS option
    Then an additional phone number field should appear
    When the user enters a valid phone number
    And submits the form
    Then a success message should appear
    And a confirmation SMS should be sent (verified via logs)
```

#### Error Path: Signup failures

```gherkin
  Scenario: User submits signup form with invalid email
    Given the user is on the signup page
    When the user enters an invalid email format
    And attempts to submit the form
    Then a validation error should appear
    And the form should not be submitted
    
  Scenario: User submits with invalid phone number for SMS
    Given the user is on the signup page
    And has selected the SMS option
    When the user enters an invalid phone number
    And attempts to submit the form
    Then a validation error should appear
    And the form should not be submitted
    
  Scenario: API failure during signup submission
    Given the user has filled the signup form with valid data
    When the form is submitted
    And the API returns an error
    Then an error toast notification should appear
    And the form data should be preserved
    And a retry option should be available
```

### Tools Directory

#### Happy Path: User explores SEO tools

```gherkin
FEATURE: SEO Tools Directory
  AS A website owner
  I WANT to access helpful SEO tools
  SO THAT I can improve my website myself

  Scenario: User browses available tools
    Given the user navigates to "/tools"
    When the tools directory page loads
    Then the user should see a categorized list of SEO tools
    And each tool should have:
      | Name                  |
      | Description           |
      | Icon/thumbnail        |
      | Usage difficulty      |
    And the tools should be filterable by category
    And the tools should be searchable

  Scenario: User uses an embedded tool
    Given the user is on the tools directory page
    When the user selects a tool that works client-side
    Then the tool interface should appear
    And the user should be able to interact with the tool
    And results should be displayed within the interface
```

#### Error Path: Tool loading issues

```gherkin
  Scenario: External tool fails to load
    Given the user selects a tool that requires external resources
    When the external resources fail to load
    Then an error message should be displayed
    And fallback instructions should be provided
    And a retry button should be available
```

---

## Component Testing

### UI Components

```gherkin
FEATURE: UI Component Functionality
  AS A user of the application
  I WANT all UI components to work correctly
  SO THAT I can interact with the application efficiently

  Scenario: Button states and accessibility
    Given a button component is rendered
    Then it should have the correct:
      | Visual styling         |
      | aria-label            |
      | disabled state when applicable |
    When the button is clicked
    Then the expected action should occur
    And focus states should be visible when using keyboard navigation

  Scenario: Form input validation
    Given a form input component is rendered
    When the user enters invalid data
    Then appropriate validation messages should appear
    And the input should be marked as invalid
    When the user enters valid data
    Then validation messages should disappear
    And the input should be marked as valid
```

### Custom Components

```gherkin
FEATURE: Audit Score Component
  AS A user viewing an audit
  I WANT to easily understand scores
  SO THAT I can quickly grasp website performance

  Scenario: Score display at different thresholds
    Given an audit score component is rendered
    When the score is:
      | > 80% | Good rating    | Green color  |
      | 50-80% | Average rating | Yellow color |
      | < 50% | Poor rating    | Red color    |
    Then the corresponding color and label should be displayed
    And an appropriate icon should be shown
    And the score percentage should be numerically displayed
```

---

## Routing Tests

```gherkin
FEATURE: Application Routing
  AS A user navigating the application
  I WANT routing to work seamlessly
  SO THAT I can access different features

  Scenario: Navigation between main sections
    Given the user is on the homepage
    When the user clicks a navigation link to "/tools"
    Then the URL should update to "/tools"
    And the tools page content should load
    And the active nav item should be highlighted
    
  Scenario: Deep linking directly to a page
    Given a user has a direct link to "/petition/business-xyz"
    When the user opens this link
    Then the petition page for "business-xyz" should load directly
    And all required data should be fetched
    
  Scenario: 404 page for unknown routes
    Given the user navigates to "/nonexistent-page"
    When the route cannot be matched
    Then a 404 page should be displayed
    And the page should offer navigation links back to valid sections
```

---

## API Integration Tests

```gherkin
FEATURE: API Data Fetching
  AS THE application
  I WANT to correctly interact with backend services
  SO THAT accurate data is displayed to users

  Scenario: Fetching audit data with React Query
    Given the application needs to display audit data
    When the useQuery hook is called with the appropriate parameters
    Then the loading state should be correctly managed
    And successful data should be cached according to configuration
    And the UI should update with the fetched data
    
  Scenario: Form submission with useMutation
    Given a user has completed a petition form
    When the form is submitted triggering useMutation
    Then the request should include all form data
    And optimistic UI updates should occur
    And on success, the UI should reflect the successful submission
    And the mutation cache should be invalidated/updated appropriately
```

---

## Supabase Integration Tests

```gherkin
FEATURE: Supabase Database Integration
  AS THE application
  I WANT to correctly interact with Supabase
  SO THAT data is properly stored and retrieved

  Scenario: Authentication flow with Supabase Auth
    Given a user attempts to access a protected route
    When Supabase auth state is checked
    Then unauthenticated users should be redirected to login
    And authenticated users should see protected content
    And auth tokens should be properly stored and refreshed

  Scenario: Real-time data subscription
    Given a user is viewing a petition page
    When the component subscribes to Supabase real-time updates
    Then new petition signatures should appear without page refresh
    And the subscription should be cleaned up on component unmount

  Scenario: Database query with RLS policies
    Given different users access the same resource
    When database queries are executed
    Then Row Level Security should properly restrict data access
    And users should only see data they are authorized to view
    
  Scenario: File storage operations
    Given a user uploads a business logo
    When the upload is processed through Supabase Storage
    Then the file should be properly stored with correct permissions
    And a public URL should be generated and returned
    And the UI should update to display the uploaded image
```

---

## Edge Cases & Error Handling

```gherkin
FEATURE: Network Resilience
  AS A user with unstable internet connection
  I WANT the application to handle network issues gracefully
  SO THAT I can still use the application effectively

  Scenario: Offline usage attempts
    Given the user's device loses internet connection
    When the user attempts to load new data
    Then an offline notification should appear
    And locally cached data should still be accessible
    And when connection is restored, a sync option should be offered
    
  Scenario: Slow network connections
    Given the user has a very slow network connection
    When data is being fetched
    Then appropriate loading states should be displayed
    And timeouts should be handled gracefully
    And partial data should be displayed if available
```

---

## Accessibility Testing

```gherkin
FEATURE: Accessibility Compliance
  AS A user with accessibility needs
  I WANT the application to be fully accessible
  SO THAT I can use all features regardless of ability

  Scenario: Screen reader compatibility
    Given a screen reader user accesses the application
    Then all interactive elements should have appropriate aria attributes
    And heading hierarchy should be logical
    And image alternatives should be provided
    And focus order should be logical
    
  Scenario: Keyboard navigation
    Given a user navigates using only a keyboard
    Then all interactive elements should be focusable
    And focus indicators should be clearly visible
    And no keyboard traps should exist
    And shortcuts should work where implemented
```

---

## Performance Testing

```gherkin
FEATURE: Page Load Performance
  AS A user of the application
  I WANT pages to load quickly
  SO THAT I can access information without delays

  Scenario: Initial page load time
    Given a user opens the application for the first time
    Then core content should be visible within 1.5 seconds
    And the First Contentful Paint (FCP) should be under 1 second
    And the Total Blocking Time (TBT) should be under 300ms
    
  Scenario: Subsequent navigation performance
    Given a user has already loaded the application
    When the user navigates to another route
    Then the page transition should appear instantaneous
    And unnecessary network requests should not be made
    And cached data should be utilized when appropriate
```
