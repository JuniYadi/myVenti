# MyVenti App Flow Activity Diagram

## Overview

This document illustrates the user activity flows and navigation patterns for the MyVenti vehicle tracking system with the modern circular home button design.

## Main App Navigation Flow

```mermaid
activityDiagram
    start
    : App Launch
    : Initialize Theme (Light/Dark)
    : Load Custom Navigation
    : Render Custom Tab Navigator

    state HomeScreen {
        [*] --> ShowVehicleDashboard
        ShowVehicleDashboard --> ViewVehicleDetails
        ShowVehicleDashboard --> ViewQuickAccessFuel
        ShowVehicleDashboard --> ViewQuickAccessService
        ViewVehicleDetails --> BackToDashboard
        ViewQuickAccessFuel --> NavigateToFuelTab
        ViewQuickAccessService --> NavigateToServiceTab
        BackToDashboard --> ShowVehicleDashboard
    }

    state VehicleScreen {
        [*] --> ShowVehicleList
        ShowVehicleList --> ViewVehicleInfo
        ShowVehicleList --> AddNewVehicle
        ViewVehicleInfo --> EditVehicle
        ViewVehicleInfo --> BackToVehicleList
        EditVehicle --> SaveVehicleChanges
        SaveVehicleChanges --> BackToVehicleList
        AddNewVehicle --> CreateVehicle
        CreateVehicle --> BackToVehicleList
        BackToVehicleList --> ShowVehicleList
    }

    state FuelScreen {
        [*] --> ShowFuelHistory
        ShowFuelHistory --> ViewFuelEntry
        ShowFuelHistory --> AddFuelEntry
        ViewFuelEntry --> EditFuelEntry
        ViewFuelEntry --> BackToFuelList
        EditFuelEntry --> SaveFuelChanges
        SaveFuelChanges --> BackToFuelList
        AddFuelEntry --> CreateFuelRecord
        CreateFuelRecord --> BackToFuelList
        BackToFuelList --> ShowFuelHistory
    }

    state ServiceScreen {
        [*] --> ShowServiceRecords
        ShowServiceRecords --> ViewServiceRecord
        ShowServiceRecords --> ScheduleService
        ViewServiceRecord --> EditServiceRecord
        ViewServiceRecord --> BackToServiceList
        EditServiceRecord --> SaveServiceChanges
        SaveServiceChanges --> BackToServiceList
        ScheduleService --> CreateServiceRecord
        CreateServiceRecord --> BackToServiceList
        BackToServiceList --> ShowServiceRecords
    }

    state SettingsScreen {
        [*] --> ShowSettingsMenu
        ShowSettingsMenu --> ToggleTheme
        ShowSettingsMenu --> ManageNotifications
        ShowSettingsMenu --> ViewAppInfo
        ShowSettingsMenu --> ExportData
        ToggleTheme --> BackToSettings
        ManageNotifications --> BackToSettings
        ViewAppInfo --> BackToSettings
        ExportData --> BackToSettings
        BackToSettings --> ShowSettingsMenu
    }

    fork
        : Handle Tab Navigation
    fork again
        : Handle Circular Home Button
    end fork

    state UserNavigation {
        [*] --> CheckNavigationTrigger
        CheckNavigationTrigger --> TabButtonPressed : Tab Click
        CheckNavigationTrigger --> HomeButtonPressed : Home Button Click

        TabButtonPressed --> DetermineTargetScreen
        HomeButtonPressed --> NavigateToHome

        DetermineTargetScreen --> NavigateToVehicle : Vehicle Tab
        DetermineTargetScreen --> NavigateToFuel : Fuel Tab
        DetermineTargetScreen --> NavigateToService : Service Tab
        DetermineTargetScreen --> NavigateToSettings : Settings Tab

        NavigateToHome --> UpdateNavigationState
        NavigateToVehicle --> UpdateNavigationState
        NavigateToFuel --> UpdateNavigationState
        NavigateToService --> UpdateNavigationState
        NavigateToSettings --> UpdateNavigationState

        UpdateNavigationState --> TriggerHapticFeedback
        TriggerHapticFeedback --> AnimateTabTransition
        AnimateTabTransition --> RenderTargetScreen

        RenderTargetScreen --> CheckNavigationTrigger
    }

    state NavigationTransitions {
        [*] --> AnimateFromCurrent
        AnimateFromCurrent --> SlideToTarget : Regular Tab
        AnimateFromCurrent --> ScaleToCenter : Home Button
        SlideToTarget --> UpdateActiveTab
        ScaleToCenter --> UpdateActiveTab
        UpdateActiveTab --> FadeInTarget
        FadeInTarget --> TransitionComplete
        TransitionComplete --> [*]
    }

    note right of UserNavigation
        **Custom Navigation Features**
        - Haptic feedback on all interactions
        - Smooth animations (60fps)
        - Theme-aware styling
        - Accessibility support
        - Responsive design
    end note

    HomeScreen --> UserNavigation
    VehicleScreen --> UserNavigation
    FuelScreen --> UserNavigation
    ServiceScreen --> UserNavigation
    SettingsScreen --> UserNavigation
    UserNavigation --> HomeScreen : Home Selected
    UserNavigation --> VehicleScreen : Vehicle Tab
    UserNavigation --> FuelScreen : Fuel Tab
    UserNavigation --> ServiceScreen : Service Tab
    UserNavigation --> SettingsScreen : Settings Tab
```

## Screen Component Architecture Flow

```mermaid
activityDiagram
    start
    : App Initialization
    : Load Theme Preferences
    : Initialize Navigation State

    state ComponentInitialization {
        [*] --> LoadThemedComponents
        LoadThemedComponents --> InitializeIcons
        InitializeIcons --> SetupHapticFeedback
        SetupHapticFeedback --> ConfigureAnimations
        ConfigureAnimations --> Ready
    }

    state NavigationRendering {
        [*] --> RenderCustomTabBar
        RenderCustomTabBar --> PositionCircularHomeButton
        PositionCircularHomeButton --> RenderTabButtons
        RenderTabButtons --> ApplyThemeStyling
        ApplyThemeStyling --> SetupGestureHandlers
        SetupGestureHandlers --> NavigationReady
    }

    state ScreenContentFlow {
        [*] --> DetermineActiveScreen
        DetermineActiveScreen --> RenderHomeContent : Home Active
        DetermineActiveScreen --> RenderVehicleContent : Vehicle Active
        DetermineActiveScreen --> RenderFuelContent : Fuel Active
        DetermineActiveScreen --> RenderServiceContent : Service Active
        DetermineActiveScreen --> RenderSettingsContent : Settings Active

        RenderHomeContent --> ShowDashboardCards
        RenderVehicleContent --> ShowVehicleList
        RenderFuelContent --> ShowFuelEntries
        RenderServiceContent --> ShowServiceRecords
        RenderSettingsContent --> ShowSettingsMenu

        ShowDashboardCards --> WaitForUserInteraction
        ShowVehicleList --> WaitForUserInteraction
        ShowFuelEntries --> WaitForUserInteraction
        ShowServiceRecords --> WaitForUserInteraction
        ShowSettingsMenu --> WaitForUserInteraction
        WaitForUserInteraction --> [*]
    }

    ComponentInitialization --> NavigationRendering
    NavigationRendering --> ScreenContentFlow

    note right of NavigationRendering
        **Custom Tab Features**
        - Circular home button in center
        - Animated tab transitions
        - Active/inactive states
        - Touch feedback
        - Smooth scrolling
    end note
```

## User Interaction Flow Diagram

```mermaid
activityDiagram
    start
    : User Opens App
    : View Home Dashboard

    state DashboardInteractions {
        [*] --> UserViewsVehicleSummary
        UserViewsVehicleSummary --> UserTapsVehicleCard : View Details
        UserViewsVehicleSummary --> UserTapsQuickFuel : Quick Fuel Access
        UserViewsVehicleSummary --> UserTapsQuickService : Quick Service Access

        UserTapsVehicleCard --> NavigateToVehicleScreen
        UserTapsQuickFuel --> NavigateToFuelScreen
        UserTapsQuickService --> NavigateToServiceScreen
    }

    state NavigationInteractions {
        [*] --> UserSeesBottomNav
        UserSeesBottomNav --> UserTapsRegularTab : Vehicle/Fuel/Service/Settings
        UserSeesBottomNav --> UserTapsCircleButton : Circular Home

        UserTapsRegularTab --> TriggerTabAnimation
        UserTapsCircleButton --> TriggerHomeAnimation

        TriggerTabAnimation --> SlideTransition
        TriggerHomeAnimation --> ScaleTransition

        SlideTransition --> ShowTargetScreen
        ScaleTransition --> ShowHomeScreen
    }

    state DataManagementFlow {
        [*] --> UserWantsToAddData
        UserWantsToAddData --> UserFillsForm
        UserFillsForm --> ValidateInput
        ValidateInput --> SaveData : Valid Input
        ValidateInput --> ShowError : Invalid Input
        SaveData --> UpdateUI
        ShowError --> UserFillsForm
        UpdateUI --> [*]
    }

    state SettingsFlow {
        [*] --> UserOpensSettings
        UserOpensSettings --> UserTogglesTheme : Light/Dark
        UserOpensSettings --> UserManagesNotifications
        UserOpensSettings --> UserExportsData

        UserTogglesTheme --> ApplyThemeGlobally
        UserManagesNotifications --> UpdateNotificationSettings
        UserExportsData --> GenerateDataFile

        ApplyThemeGlobally --> RefreshAllScreens
        UpdateNotificationSettings --> SavePreference
        GenerateDataFile --> OfferDownload
    }

    DashboardInteractions --> NavigationInteractions
    NavigationInteractions --> DataManagementFlow
    DataManagementFlow --> SettingsFlow

    note left of NavigationInteractions
        **Key Navigation Features**
        - Quick access via home button
        - Intuitive tab navigation
        - Visual feedback on all interactions
        - Consistent animation patterns
    end note
```

## Component State Management Flow

```mermaid
activityDiagram
    start
    : App Starts
    : Initialize Navigation Context
    : Load User Preferences

    state StateManagement {
        [*] --> SetInitialState
        SetInitialState --> ListenForNavigationChanges
        ListenForNavigationChanges --> UserInteractionDetected : User Action

        UserInteractionDetected --> UpdateNavigationState
        UpdateNavigationState --> TriggerAnimations
        TriggerAnimations --> UpdateActiveIndicators
        UpdateActiveIndicators --> PersistState
        PersistState --> ListenForNavigationChanges
    }

    state AnimationStates {
        [*] --> DetermineAnimationType
        DetermineAnimationType --> RegularTabAnimation : Tab Switch
        DetermineAnimationType --> HomeButtonAnimation : Home Press
        DetermineAnimationType --> NoAnimation : Same Screen

        RegularTabAnimation --> SlideAndFade
        HomeButtonAnimation --> ScaleAndFade
        NoAnimation --> [*]

        SlideAndFade --> AnimationComplete
        ScaleAndFade --> AnimationComplete
        AnimationComplete --> [*]
    }

    state ThemeApplication {
        [*] --> CheckSystemTheme
        CheckSystemTheme --> LoadUserThemePreference
        LoadUserThemePreference --> ApplyThemeToComponents
        ApplyThemeToComponents --> UpdateNavigationStyling
        UpdateNavigationStyling --> RefreshScreenContent
        RefreshScreenContent --> [*]
    }

    StateManagement --> AnimationStates
    StateManagement --> ThemeApplication
```

## Mobile Responsiveness Flow

```mermaid
activityDiagram
    start
    : App Launch
    : Detect Device Properties
    : Calculate Screen Dimensions

    state ResponsiveLayout {
        [*] --> DetermineScreenSize
        DetermineScreenSize --> SmallScreenLayout : < 375px
        DetermineScreenSize --> MediumScreenLayout : 375-414px
        DetermineScreenSize --> LargeScreenLayout : > 414px

        SmallScreenLayout --> CompactNavigation
        MediumScreenLayout --> StandardNavigation
        LargeScreenLayout --> SpaciousNavigation

        CompactNavigation --> AdjustButtonSizes
        StandardNavigation --> UseDefaultSizes
        SpaciousNavigation --> IncreaseSpacing

        AdjustButtonSizes --> ApplySmallTypography
        UseDefaultSizes --> ApplyStandardTypography
        IncreaseSpacing --> ApplyLargeTypography

        ApplySmallTypography --> ValidateTouchTargets
        ApplyStandardTypography --> ValidateTouchTargets
        ApplyLargeTypography --> ValidateTouchTargets

        ValidateTouchTargets --> LayoutOptimized
    }

    state OrientationHandling {
        [*] --> CheckOrientation
        CheckOrientation --> PortraitLayout : Portrait
        CheckOrientation --> LandscapeLayout : Landscape

        PortraitLayout --> VerticalNavigation
        LandscapeLayout --> HorizontalNavigation

        VerticalNavigation --> OptimizeForPortrait
        HorizontalNavigation --> OptimizeForLandscape

        OptimizeForPortrait --> ValidatePortraitLayout
        OptimizeForLandscape --> ValidateLandscapeLayout

        ValidatePortraitLayout --> OrientationHandled
        ValidateLandscapeLayout --> OrientationHandled
    }

    ResponsiveLayout --> OrientationHandling
```

## Key Flow Features

### Navigation Highlights
- **Central Home Button**: Always accessible circular button for quick home access
- **Smooth Transitions**: All navigation includes animated transitions
- **Haptic Feedback**: Physical feedback on all interactions
- **Theme Consistency**: All screens follow current theme (light/dark)

### User Experience Features
- **Quick Dashboard**: Home screen provides overview with quick access
- **Intuitive Flow**: Clear navigation patterns between sections
- **Data Management**: Consistent patterns for adding/editing data
- **Settings Access**: Easy access to app configuration

### Technical Features
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: 60fps animations and smooth transitions
- **Accessibility**: Proper touch targets and screen reader support
- **State Management**: Consistent state handling across navigation

This activity diagram provides a comprehensive view of how users interact with the MyVenti app and how the navigation flow works with the modern circular home button design.