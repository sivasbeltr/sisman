# SISMAN - System Management Application

## Project Overview
SISMAN is being developed to monitor application services in the organization and to safely execute specific commands. It also includes infrastructure management features such as nginx server configurations and subdomain management.

## Technology Stack
### Backend
- Go Programming Language
- Fiber web framework
- GORM (ORM library)
- SQLite database

### Frontend
- Vite (Build tool)
- React (UI library)
- Tailwind CSS (Styling library)
- React Router (Page routing)
- Hero Icons (Icon package)
- Chart.js (For graphs)
- Axios (HTTP client for API requests)

## Architecture
- Single Page Application (SPA) architecture
- Frontend and backend should operate independently
- All frontend operations must be performed through API services
- Mobile-responsive design
- Light/dark theme support

## Backend Development Principles
- All services must be atomically designed
- Each function should do only one thing
- Modular structure must be maintained
- API endpoints must follow RESTful principles
- Database operations should be done with GORM
- Commands, parameters, types, and required status must be stored in the database
- Special services for Nginx and subdomain management must be developed
- API endpoints should follow the pattern: `/api/v1/sisman/{service|command|nginx|docker|user}`

## Frontend Development Principles
- Atomic design principles (Components should be broken down into smallest parts)
- Each component must be reusable
- All data operations must be done through services
- Page layout:
  - Sidebar menu on the left
  - Navbar at the top
  - Content area in the middle
- Loading indicators must be displayed during data update operations
- Forms should be dynamically created based on command and parameter information in the database

## Frontend Component Structure
Components are organized by functionality and are located in the following directories:

### Main Layout Components
- `/components/Layout.tsx` - Main application layout structure
- `/components/Sidebar.tsx` - Navigation sidebar with collapsible menu groups
- `/components/Navbar.tsx` - Top navigation bar
- `/components/Content.tsx` - Dashboard overview/home page content

### Chart Components
- `/components/charts/ChartWrapper.tsx` - Base chart component wrapper
- `/components/charts/BarChart.tsx` - Bar chart visualization
- `/components/charts/LineChart.tsx` - Line chart for time series data
- `/components/charts/PieChart.tsx` - Pie chart visualization
- `/components/charts/DoughnutChart.tsx` - Doughnut chart visualization
- `/components/charts/PolarAreaChart.tsx` - Polar area chart

### Dialog Components
- `/components/dialogs/Dialog.tsx` - Base dialog component
- `/components/dialogs/AlertDialog.tsx` - Alert message dialog
- `/components/dialogs/ConfirmDialog.tsx` - Confirmation dialog with actions
- `/components/dialogs/LoadingDialog.tsx` - Loading indicator dialog
- `/components/dialogs/ProgressDialog.tsx` - Progress bar dialog
- `/components/dialogs/CountdownDialog.tsx` - Dialog with countdown timer
- `/components/dialogs/PickerDialog.tsx` - Selection dialog

### Form Components
- `/components/forms/TextField.tsx` - Text input field
- `/components/forms/TextArea.tsx` - Multi-line text input
- `/components/forms/Select.tsx` - Dropdown select input
- `/components/forms/Checkbox.tsx` - Checkbox component
- `/components/forms/RadioGroup.tsx` - Radio button group
- `/components/forms/Switch.tsx` - Toggle switch
- `/components/forms/DatePicker.tsx` - Date selection component
- `/components/forms/AutoComplete.tsx` - Text input with autocomplete
- `/components/forms/RangeSlider.tsx` - Slider for range selection
- `/components/forms/RangeBrush.tsx` - Advanced range selection with brush
- `/components/forms/DateRangeSlider.tsx` - Date range slider
- `/components/forms/DateRangeBrush.tsx` - Date range with brush selection
- `/components/forms/TimeRangeSlider.tsx` - Time range slider
- `/components/forms/TimeRangeBrush.tsx` - Time range with brush selection

### Common UI Components
- `/components/common/Button.tsx` - Button with various styles
- `/components/common/Alert.tsx` - Alert/notification component
- `/components/common/Badge.tsx` - Badge/tag component
- `/components/common/Card.tsx` - Card container component
- `/components/common/Panel.tsx` - Panel container component
- `/components/common/Accordion.tsx` - Collapsible accordion container
- `/components/common/AccordionItem.tsx` - Single accordion item
- `/components/common/TabBar.tsx` - Tab navigation container
- `/components/common/TabPage.tsx` - Individual tab page
- `/components/common/Breadcrumb.tsx` - Breadcrumb navigation
- `/components/common/Dropdown.tsx` - Dropdown menu
- `/components/common/ListGroup.tsx` - List group component
- `/components/common/Pagination.tsx` - Pagination controls
- `/components/common/Progress.tsx` - Progress indicator
- `/components/common/Stepper.tsx` - Multi-step process indicator
- `/components/common/StepperItem.tsx` - Single step in stepper
- `/components/common/Toast.tsx` - Toast notification
- `/components/common/ToastContainer.tsx` - Toast notification manager
- `/components/common/Timeline.tsx` - Vertical timeline component
- `/components/common/TimelineItem.tsx` - Single timeline entry
- `/components/common/Carousel.tsx` - Image/content carousel

### Data Display Components
- `/components/data/Tree.tsx` - Tree view component
- `/components/data/TreeNode.tsx` - Single node in tree view

## API Communication with Axios
- Create a centralized Axios instance with default configurations
- Implement interceptors for authentication token management
- Set up global error handling for API responses
- Create separate service modules for each API domain area
- All API calls should use async/await pattern
- Implement request/response type definitions for better type safety
- Add loading state management for all API calls
- Implement retry logic for failed requests when appropriate
- Structure services in the following way:
  - `/services/api.ts` - Core Axios configuration
  - `/services/{domain}Service.ts` - Domain-specific API calls

### Axios Instance Configuration
```javascript
// Base Axios configuration
const axiosInstance = axios.create({
  baseURL: '/api/v1/sisman',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

### Service Module Example
```javascript
// Example service module
export const serviceMonitoringService = {
  getServices: async () => {
    const response = await axiosInstance.get('/service');
    return response.data;
  },
  
  getServiceMetrics: async (serviceId) => {
    const response = await axiosInstance.get(`/service/${serviceId}/metrics`);
    return response.data;
  },
  
  // Other service-related API calls
};
```

## Code Standards
- Application code should be in English (variable, function, class names)
- All frontend texts and comments should be in Turkish
- Backend code must be well documented
- Unit tests must be written for all components

## Feature Requirements
1. **Service Monitoring**
   - Real-time monitoring of service status
   - Service metrics (CPU, memory usage, etc.)
   - Historical performance graphs

2. **Command Management**
   - Execution of secure commands
   - Dynamic creation of command parameters
   - Display of command results

3. **Nginx Configuration**
   - Subdomain management
   - Server block configuration
   - SSL certificate management

4. **Docker Container Monitoring**
   - Real-time monitoring of all containers
   - Start/stop container operations
   - Viewing container logs
   - Performing all types of container inspection
   - Container resource usage statistics
   - Image management

5. **User Management**
   - Role-based access control
   - User activity monitoring

## Development Workflow
1. First develop backend services
2. Document API endpoints
3. Develop frontend components
4. Perform integration tests
5. Improve interface and user experience

## API Structure
- Service monitoring: `/api/v1/sisman/service`
- Command management: `/api/v1/sisman/command`
- Nginx configuration: `/api/v1/sisman/nginx`
- Docker monitoring: `/api/v1/sisman/docker`
- User management: `/api/v1/sisman/user`

## Notes
- Security must be at the highest level
- Command execution operations must be logged
- Detailed error handling for API requests
- User-friendly error messages must be displayed
- All API responses should be cached appropriately to minimize requests
- Implement cancelable requests for long-running operations
