# Abadaat Tracker

A web application to track various forms of Islamic worship (abadaat) including prayers, Qur'an reading, dhikr, du'a, and more.

## Project Overview

The Abadaat Tracker helps Muslims keep track of their daily worship activities and visualize their progress over time. The application provides a simple and intuitive interface to log different types of worship and view trends through charts and statistics.

## Features

- Track multiple forms of worship:
  - Daily prayers (Salah) with prayer times display
  - Qur'an reading
  - Dhikr (remembrance of Allah)
  - Du'a (supplication) with links to online resources
- Visualize progress with interactive charts and trends
- Islamic-themed UI with green color palette
- Responsive design for all devices
- Data persistence using local storage
- Dark/Light mode toggle
- Prayer streak tracking
- Milton Keynes prayer times based on astronomical data
- Solar midnight indicator for Isha qadha time

## Components

- **Dashboard**: Overview of all worship activities with statistics and charts
- **Prayer Tracker**: Track your five daily prayers and view prayer times
- **Quran Tracker**: Log your Qur'an reading progress
- **Dhikr Tracker**: Count and track different forms of dhikr
- **Du'a Tracker**: Record your du'a recitations and add links to online resources
- **Prayer Times Display**: View prayer times for Milton Keynes based on astronomical data
- **Historical Data Charts**: Visualize your worship trends over time

## Recent Updates

### Prayer Times Feature (Latest)
- Updated to use Milton Keynes astronomical data for prayer times
- Implemented correct Islamic prayer time calculation methods
- Added solar midnight indicator (when Isha becomes qadha)
- Real-time display of current time and next prayer
- Visual indicators for current, upcoming, and passed prayers
- Direct link to timeanddate.com for detailed sun data
- Prayer streak tracking to monitor consistency

### Prayer Times Calculation Method
The application now uses astronomical data for Milton Keynes to calculate prayer times according to Islamic rules:
- **Fajr**: Based on nautical twilight start (sun is 12° below horizon)
- **Dhuhr**: Based on solar noon (when sun reaches highest point)
- **Asr**: Calculated as midpoint between Dhuhr and sunset
- **Maghrib**: 20 minutes after sunset
- **Isha**: Midpoint between sunset and solar midnight
- **Solar Midnight**: Opposite of solar noon (when Isha becomes qadha)

The data is derived from timeanddate.com's astronomical calculations for Milton Keynes, UK.

### Du'a Links Feature
- Added ability to include links to online du'a resources
- Integration with popular sites like Duas.org
- Quick access to du'a references
- Sample du'as with links to their sources

### UI Improvements
- Enhanced responsive design
- British English spelling throughout the application
- Improved navigation and user experience
- Better visual feedback for completed actions
- Dark mode support for all components

## Project Status

- [x] Project structure setup
- [x] Basic UI components
- [x] Islamic-themed styling
- [x] Prayer tracking functionality
- [x] Qur'an reading tracker
- [x] Dhikr counter implementation
- [x] Du'a tracking
- [x] Data visualization with Chart.js
- [x] Local storage implementation
- [x] Du'a links to online resources
- [x] Milton Keynes prayer times based on astronomical data
- [x] Solar midnight indicator for Isha qadha time
- [ ] User authentication (future)
- [ ] Cloud synchronization (future)
- [ ] Qibla direction finder (future)
- [ ] Prayer time notifications (future)
- [ ] Support for multiple locations (future)

## Technology Stack

- React 18
- TypeScript
- Chakra UI for component library
- Chart.js and React-Chartjs-2 for data visualization
- React Router for navigation
- Local Storage for data persistence
- React Icons for UI icons
- Date-fns for date manipulation
- Astronomical data for Milton Keynes prayer times

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/abadaat-tracker.git
cd abadaat-tracker
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

- **Dashboard**: View an overview of all your worship activities
- **Prayer Tracker**: Mark your daily prayers as completed and view prayer times
- **Quran Tracker**: Log the pages or verses you've read
- **Dhikr Tracker**: Use the counter to track different forms of dhikr
- **Du'a Tracker**: Record your du'a recitations and add links to online resources

## Prayer Times Feature

### Current Implementation
The prayer times feature displays accurate prayer times for Milton Keynes, UK:
- Times are calculated based on astronomical data for Milton Keynes
- The app shows the current date and time
- Prayer times are highlighted based on their status (current, upcoming, or passed)
- The next prayer is prominently displayed
- Solar midnight is shown to indicate when Isha becomes qadha

### Prayer Time Calculation Method
Prayer times are calculated using the following astronomical events and Islamic rules:
- **Fajr**: Nautical twilight start (sun is 12° below horizon)
- **Dhuhr**: Solar noon (when sun reaches highest point)
- **Asr**: Midpoint between Dhuhr and sunset
- **Maghrib**: 20 minutes after sunset
- **Isha**: Midpoint between sunset and solar midnight
- **Solar Midnight**: Opposite of solar noon (when Isha becomes qadha)

### Data Source
The prayer times data is derived from timeanddate.com's astronomical calculations for Milton Keynes, UK. The application uses this data to calculate prayer times according to Islamic rules.

## Future Enhancements

1. **Multiple Locations**: Add support for multiple cities beyond Milton Keynes
2. **Custom Prayer Time Adjustments**: Allow users to adjust prayer times based on their preferred calculation method
3. **Prayer Time Notifications**: Send notifications when prayer times approach
4. **Calendar View**: Show prayer times for the entire month in a calendar view
5. **Offline Support**: Improve offline functionality with cached prayer times data
6. **Different Calculation Methods**: Support for various Islamic calculation methods (Hanafi, Shafi, etc.)

## Screenshots

(Screenshots will be added as the project progresses)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by the need for Muslims to track their worship activities
- Thanks to timeanddate.com for providing astronomical data for Milton Keynes
- Thanks to Duas.org and other Islamic resources for du'a references
- Thanks to the open-source community for providing the tools and libraries used in this project
