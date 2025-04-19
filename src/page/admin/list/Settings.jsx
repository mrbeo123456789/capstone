import { useState } from 'react';
import {
    Settings, Save, Users, Bell, Database, Globe, Shield,
    Mail, Server, RefreshCw, Clock, Award, Plus, Trash2, Edit
} from 'lucide-react';
import Sidebar from "../../navbar/AdminNavbar.jsx";
import {
    useGetChallengeTypesQuery,
    useCreateChallengeTypeMutation,
    useUpdateChallengeTypeMutation,
    useDeleteChallengeTypeMutation,
    useGetInterestsQuery,
    useCreateInterestMutation,
    useUpdateInterestMutation,
    useDeleteInterestMutation
} from "../../../service/adminService.js";

const AdminSettings = () => {
    // State cho các phần cài đặt
    const [activeTab, setActiveTab] = useState('general');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'Challenge Platform',
        siteDescription: 'A platform for creating and participating in challenges',
        maintenanceMode: false,
        defaultLanguage: 'vi-VN',
        timeZone: 'Asia/Ho_Chi_Minh',
        registrationOpen: true,
        maxUploadSize: 5, // in MB
        itemsPerPage: 10
    });

    const [userSettings, setUserSettings] = useState({
        autoApproveUsers: false,
        defaultUserRole: 'member',
        minPasswordLength: 8,
        passwordRequiresSpecialChar: true,
        passwordRequiresNumber: true,
        maximumLoginAttempts: 5,
        lockoutDuration: 30, // minutes
        sessionTimeout: 60 // minutes
    });

    const [notificationSettings, setNotificationSettings] = useState({
        enableEmailNotifications: true,
        enablePushNotifications: false,
        adminNotifyOnNewUser: true,
        adminNotifyOnNewChallenge: true,
        challengeCreationNotification: true,
        evidenceSubmissionNotification: true,
        challengeCompletionNotification: true,
        systemUpdatesNotification: true
    });

    const [emailSettings, setEmailSettings] = useState({
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpUsername: 'admin@example.com',
        smtpPassword: '********',
        senderName: 'Challenge Platform',
        senderEmail: 'noreply@example.com',
        enableSsl: true
    });

    const [systemSettings, setSystemSettings] = useState({
        backupFrequency: 'daily',
        backupRetention: 30, // days
        logLevel: 'info',
        enableAuditLog: true,
        debugMode: false,
        apiRateLimit: 100 // requests per minute
    });

    // --- Challenge Settings State & Logic ---
    const { data: challengeTypesData, isLoading: loadingChallengeTypes } = useGetChallengeTypesQuery({
        keyword: '',
        page: 0,
        size: 10
    });
    const [createChallengeType] = useCreateChallengeTypeMutation();
    const [updateChallengeType] = useUpdateChallengeTypeMutation();
    const [deleteChallengeType] = useDeleteChallengeTypeMutation();
    const [newChallengeType, setNewChallengeType] = useState({
        name: '',
        description: '',
        id: '',
        isActive: true
    });
    const [editingChallengeType, setEditingChallengeType] = useState(null);
    const [showChallengeTypeForm, setShowChallengeTypeForm] = useState(false);

    const { data: interestsData, isLoading: loadingInterests } = useGetInterestsQuery({
        keyword: '',
        page: 0,
        size: 10
    });
    const [createInterest] = useCreateInterestMutation();
    const [updateInterest] = useUpdateInterestMutation();
    const [deleteInterest] = useDeleteInterestMutation();

    const [newInteres, setNewInteres] = useState({
        name: '',
        id: '',
        isActive: true
    });
    const [editingInteres, setEditingInteres] = useState(null);
    const [showInteresForm, setShowInteresForm] = useState(false);


    const handleChallengeTypeChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewChallengeType({
            ...newChallengeType,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    const handleInteresChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewInteres({
            ...newInteres,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleEditChallengeType = (type) => {
        setEditingChallengeType(type.id);
        setNewChallengeType({
            name: type.name,
            description: type.description,
            isActive: type.isActive
        });
        setShowChallengeTypeForm(true);
    };

    const handleDeleteChallengeType = async (id) => {
        if (window.confirm('Are you sure you want to delete this challenge type?')) {
            try {
                await deleteChallengeType(id).unwrap();
            } catch (err) {
                console.error("Error deleting challenge type", err);
                alert("Failed to delete challenge type.");
            }
        }
    };

    const handleAddOrUpdateChallengeType = async () => {
        if (!newChallengeType.name) {
            alert('Challenge type name is required');
            return;
        }
        try {
            if (editingChallengeType) {
                await updateChallengeType({ id: editingChallengeType, challengeType: newChallengeType }).unwrap();
                setEditingChallengeType(null);
            } else {
                await createChallengeType(newChallengeType).unwrap();
            }
            setNewChallengeType({
                name: '',
                description: '',
                id: '',
                isActive: true
            });
            setShowChallengeTypeForm(false);
        } catch (err) {
            console.error("Error saving challenge type", err);
            alert("Failed to save challenge type.");
        }
    };

    const handleCancelChallengeType = () => {
        setNewChallengeType({
            name: '',
            description: '',
            id: '',
            isActive: true
        });
        setEditingChallengeType(null);
        setShowChallengeTypeForm(false);
    };


    const handleEditInteres = (type) => {
        setEditingInteres(type.id);
        setNewInteres({
            name: type.name,
            isActive: type.isActive
        });
        setShowInteresForm(true);
    };
    const handleDeleteInteres = async (id) => {
        if (window.confirm('Are you sure you want to delete this interes?')) {
            try {
                await deleteInterest(id).unwrap();
            } catch (err) {
                console.error("Error deleting interes", err);
                alert("Failed to delete interes.");
            }
        }
    };
    const handleAddOrUpdateInteres = async () => {
        if (!newInteres.name) {
            alert('Interes name is required');
            return;
        }
        try {
            if (editingInteres) {
                await updateInterest({ id: editingInteres, interest: newInteres }).unwrap();
                setEditingInteres(null);
            } else {
                await createInterest(newInteres).unwrap();
            }
            setNewInteres({
                name: '',
                id:'',
                isActive: true
            });
            setShowInteresForm(false);
        } catch (err) {
            console.error("Error saving interes", err);
            alert("Failed to save interes.");
        }
    };
    const handleCancelInteres = () => {
        setNewInteres({
            name: '',
            id:'',
            isActive: true
        });
        setEditingInteres(null);
        setShowInteresForm(false);
    };
    // ---------------------------------------------

    // Handle form submission cho tất cả settings
    const handleSaveSettings = (e) => {
        e.preventDefault();
        // Thông thường sẽ gửi các cài đặt lên API
        alert('Settings saved successfully!');
    };

    // Các hàm xử lý thay đổi cho từng phần
    const handleGeneralChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGeneralSettings({
            ...generalSettings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleUserChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserSettings({
            ...userSettings,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
        });
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotificationSettings({
            ...notificationSettings,
            [name]: checked
        });
    };

    const handleEmailChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEmailSettings({
            ...emailSettings,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
        });
    };

    const handleSystemChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSystemSettings({
            ...systemSettings,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
        });
    };

    // Hàm ví dụ để test email settings và chạy backup
    const handleTestEmail = () => {
        alert('Test email sent! Please check your inbox.');
    };

    const handleRunBackup = () => {
        alert('System backup initiated!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 py-8">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}/>
                </div>
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-orange-500 text-white p-6">
                            <div className="flex items-center">
                                <Settings className="h-8 w-8 mr-3"/>
                                <h1 className="text-2xl font-bold">Admin Configuration</h1>
                            </div>
                            <p className="mt-2">Configure and manage system-wide settings and preferences</p>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col md:flex-row">
                            {/* Sidebar */}
                            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
                                <nav className="p-4">
                                    <ul>
                                        <li className="mb-1">
                                            <button
                                                onClick={() => setActiveTab('general')}
                                                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                                                    activeTab === 'general'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-700 hover:bg-orange-100'
                                                }`}
                                            >
                                                <Globe className="h-5 w-5 mr-3"/>
                                                General Settings
                                            </button>
                                        </li>
                                        <li className="mb-1">
                                            <button
                                                onClick={() => setActiveTab('users')}
                                                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                                                    activeTab === 'users'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-700 hover:bg-orange-100'
                                                }`}
                                            >
                                                <Users className="h-5 w-5 mr-3"/>
                                                User Settings
                                            </button>
                                        </li>
                                        <li className="mb-1">
                                            <button
                                                onClick={() => setActiveTab('notifications')}
                                                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                                                    activeTab === 'notifications'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-700 hover:bg-orange-100'
                                                }`}
                                            >
                                                <Bell className="h-5 w-5 mr-3"/>
                                                Notifications
                                            </button>
                                        </li>
                                        <li className="mb-1">
                                            <button
                                                onClick={() => setActiveTab('email')}
                                                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                                                    activeTab === 'email'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-700 hover:bg-orange-100'
                                                }`}
                                            >
                                                <Mail className="h-5 w-5 mr-3"/>
                                                Email Configuration
                                            </button>
                                        </li>
                                        <li className="mb-1">
                                            <button
                                                onClick={() => setActiveTab('challenges')}
                                                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                                                    activeTab === 'challenges'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-700 hover:bg-orange-100'
                                                }`}
                                            >
                                                <Award className="h-5 w-5 mr-3"/>
                                                Challenge Settings
                                            </button>
                                        </li>
                                        <li className="mb-1">
                                            <button
                                                onClick={() => setActiveTab('interes')}
                                                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                                                    activeTab === 'interes'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-700 hover:bg-orange-100'
                                                }`}
                                            >
                                                <Award className="h-5 w-5 mr-3"/>
                                                Interes Settings
                                            </button>
                                        </li>
                                        <li className="mb-1">
                                            <button
                                                onClick={() => setActiveTab('system')}
                                                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                                                    activeTab === 'system'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-700 hover:bg-orange-100'
                                                }`}
                                            >
                                                <Server className="h-5 w-5 mr-3"/>
                                                System Maintenance
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6">
                                <form onSubmit={handleSaveSettings}>
                                    {/* General Settings */}
                                    {activeTab === 'general' && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                                <Globe className="h-5 w-5 mr-2"/> General Settings
                                            </h2>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Các input cho general settings giữ nguyên */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Site Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="siteName"
                                                        value={generalSettings.siteName}
                                                        onChange={handleGeneralChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Default Language
                                                    </label>
                                                    <select
                                                        name="defaultLanguage"
                                                        value={generalSettings.defaultLanguage}
                                                        onChange={handleGeneralChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        <option value="vi-VN">Vietnamese</option>
                                                        <option value="en-US">English</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Time Zone
                                                    </label>
                                                    <select
                                                        name="timeZone"
                                                        value={generalSettings.timeZone}
                                                        onChange={handleGeneralChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        <option value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</option>
                                                        <option value="Asia/Tokyo">Japan (GMT+9)</option>
                                                        <option value="Europe/London">London (GMT+0)</option>
                                                        <option value="America/New_York">New York (GMT-5)</option>
                                                        <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Items Per Page
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="itemsPerPage"
                                                        min="5"
                                                        max="100"
                                                        value={generalSettings.itemsPerPage}
                                                        onChange={handleGeneralChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Site Description
                                                    </label>
                                                    <textarea
                                                        name="siteDescription"
                                                        value={generalSettings.siteDescription}
                                                        onChange={handleGeneralChange}
                                                        rows="3"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    ></textarea>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Max Upload Size (MB)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="maxUploadSize"
                                                        min="1"
                                                        max="50"
                                                        value={generalSettings.maxUploadSize}
                                                        onChange={handleGeneralChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="registrationOpen"
                                                            name="registrationOpen"
                                                            checked={generalSettings.registrationOpen}
                                                            onChange={handleGeneralChange}
                                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="registrationOpen" className="ml-2 block text-sm text-gray-700">
                                                            Allow New User Registrations
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="maintenanceMode"
                                                            name="maintenanceMode"
                                                            checked={generalSettings.maintenanceMode}
                                                            onChange={handleGeneralChange}
                                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                                                            Enable Maintenance Mode
                                                        </label>
                                                    </div>
                                                    {generalSettings.maintenanceMode && (
                                                        <p className="mt-1 text-sm text-red-500">
                                                            Warning: When enabled, only administrators can access the site.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* User Settings */}
                                    {activeTab === 'users' && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                                <Shield className="h-5 w-5 mr-2"/> User & Security Settings
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Default User Role
                                                    </label>
                                                    <select
                                                        name="defaultUserRole"
                                                        value={userSettings.defaultUserRole}
                                                        onChange={handleUserChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="contributor">Challenge Host</option>
                                                        <option value="moderator">Co-Host</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Minimum Password Length
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="minPasswordLength"
                                                        min="6"
                                                        max="20"
                                                        value={userSettings.minPasswordLength}
                                                        onChange={handleUserChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Maximum Login Attempts
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="maximumLoginAttempts"
                                                        min="1"
                                                        max="10"
                                                        value={userSettings.maximumLoginAttempts}
                                                        onChange={handleUserChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Account Lockout Duration (minutes)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="lockoutDuration"
                                                        min="5"
                                                        max="1440"
                                                        value={userSettings.lockoutDuration}
                                                        onChange={handleUserChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Session Timeout (minutes)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="sessionTimeout"
                                                        min="5"
                                                        max="1440"
                                                        value={userSettings.sessionTimeout}
                                                        onChange={handleUserChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="autoApproveUsers"
                                                            name="autoApproveUsers"
                                                            checked={userSettings.autoApproveUsers}
                                                            onChange={handleUserChange}
                                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="autoApproveUsers"
                                                               className="ml-2 block text-sm text-gray-700">
                                                            Automatically Approve New Users
                                                        </label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="passwordRequiresSpecialChar"
                                                            name="passwordRequiresSpecialChar"
                                                            checked={userSettings.passwordRequiresSpecialChar}
                                                            onChange={handleUserChange}
                                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="passwordRequiresSpecialChar"
                                                               className="ml-2 block text-sm text-gray-700">
                                                            Require Special Characters in Password
                                                        </label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="passwordRequiresNumber"
                                                            name="passwordRequiresNumber"
                                                            checked={userSettings.passwordRequiresNumber}
                                                            onChange={handleUserChange}
                                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="passwordRequiresNumber"
                                                               className="ml-2 block text-sm text-gray-700">
                                                            Require Numbers in Password
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notification Settings */}
                                    {activeTab === 'notifications' && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                                <Bell className="h-5 w-5 mr-2"/> Notification Settings
                                            </h2>
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="enableEmailNotifications"
                                                        name="enableEmailNotifications"
                                                        checked={notificationSettings.enableEmailNotifications}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="enableEmailNotifications"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Enable Email Notifications
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="enablePushNotifications"
                                                        name="enablePushNotifications"
                                                        checked={notificationSettings.enablePushNotifications}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="enablePushNotifications"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Enable Push Notifications
                                                    </label>
                                                </div>

                                                <hr className="my-4"/>
                                                <h3 className="font-medium text-gray-900">Admin Notifications</h3>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="adminNotifyOnNewUser"
                                                        name="adminNotifyOnNewUser"
                                                        checked={notificationSettings.adminNotifyOnNewUser}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="adminNotifyOnNewUser"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Notify Admins When New Users Register
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="adminNotifyOnNewChallenge"
                                                        name="adminNotifyOnNewChallenge"
                                                        checked={notificationSettings.adminNotifyOnNewChallenge}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="adminNotifyOnNewChallenge"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Notify Admins When New Challenges Are Created
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="adminNotifyOnNewChallenge"
                                                        name="adminNotifyOnNewChallenge"
                                                        checked={notificationSettings.adminNotifyOnNewReport}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="adminNotifyOnNewChallenge"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Notify Admins When New Reports Are Created
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="adminNotifyOnNewChallenge"
                                                        name="adminNotifyOnNewChallenge"
                                                        checked={notificationSettings.adminNotifyOnNewGroup}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="adminNotifyOnNewChallenge"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Notify Admins When New Groups Are Created
                                                    </label>
                                                </div>

                                                <hr className="my-4"/>
                                                <h3 className="font-medium text-gray-900">User Notifications</h3>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="challengeCreationNotification"
                                                        name="challengeCreationNotification"
                                                        checked={notificationSettings.challengeCreationNotification}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="challengeCreationNotification"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Notify Users When New Challenges Are Created
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="evidenceSubmissionNotification"
                                                        name="evidenceSubmissionNotification"
                                                        checked={notificationSettings.evidenceSubmissionNotification}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="evidenceSubmissionNotification"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Notify Challenge Host When Evidence Is Submitted
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="challengeCompletionNotification"
                                                        name="challengeCompletionNotification"
                                                        checked={notificationSettings.challengeCompletionNotification}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="challengeCompletionNotification"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Notify Users When Challenges Are Completed
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="systemUpdatesNotification"
                                                        name="systemUpdatesNotification"
                                                        checked={notificationSettings.systemUpdatesNotification}
                                                        onChange={handleNotificationChange}
                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="systemUpdatesNotification"
                                                           className="ml-2 block text-sm text-gray-700">
                                                        Notify All Users About System Updates
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Email Settings */}
                                    {activeTab === 'email' && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                                <Mail className="h-5 w-5 mr-2"/> Email Configuration
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        SMTP Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="smtpUsername"
                                                        value={emailSettings.smtpUsername}
                                                        onChange={handleEmailChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        SMTP Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="smtpPassword"
                                                        value={emailSettings.smtpPassword}
                                                        onChange={handleEmailChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Sender Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="senderName"
                                                        value={emailSettings.senderName}
                                                        onChange={handleEmailChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Sender Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="senderEmail"
                                                        value={emailSettings.senderEmail}
                                                        onChange={handleEmailChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="enableSsl"
                                                            name="enableSsl"
                                                            checked={emailSettings.enableSsl}
                                                            onChange={handleEmailChange}
                                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="enableSsl"
                                                               className="ml-2 block text-sm text-gray-700">
                                                            Enable SSL/TLS
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-span-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleTestEmail}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    >
                                                        Send Test Email
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Challenge Settings */}
                                    {activeTab === 'challenges' && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                                <Award className="h-5 w-5 mr-2"/> Challenge Types
                                            </h2>

                                            <div className="mb-8">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-medium text-gray-800">Challenge Types</h3>
                                                    {!showChallengeTypeForm && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowChallengeTypeForm(true)}
                                                            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1"/> Add New Type
                                                        </button>
                                                    )}
                                                </div>

                                                {showChallengeTypeForm && (
                                                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                                                        <h4 className="text-md font-medium mb-3">
                                                            {editingChallengeType ? 'Edit Challenge Type' : 'Add New Challenge Type'}
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Type Name*
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    value={newChallengeType.name}
                                                                    onChange={handleChallengeTypeChange}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="col-span-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Description
                                                                </label>
                                                                <textarea
                                                                    name="description"
                                                                    value={newChallengeType.description}
                                                                    onChange={handleChallengeTypeChange}
                                                                    rows="2"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                ></textarea>
                                                            </div>

                                                            <div className="col-span-2">
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="isActive"
                                                                        name="isActive"
                                                                        checked={newChallengeType.isActive}
                                                                        onChange={handleChallengeTypeChange}
                                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                                    />
                                                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                                                        Active (Available for new challenges)
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 flex justify-end space-x-3">
                                                            <button
                                                                type="button"
                                                                onClick={handleCancelChallengeType}
                                                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleAddOrUpdateChallengeType}
                                                                className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                                            >
                                                                {editingChallengeType ? 'Update Type' : 'Add Type'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Name
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Description
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                        {loadingChallengeTypes ? (
                                                            <tr>
                                                                <td colSpan="4" className="text-center">Loading...</td>
                                                            </tr>
                                                        ) : challengeTypesData?.content && challengeTypesData.content.length > 0 ? (
                                                            challengeTypesData.content.map((type) => (
                                                                <tr key={type.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">{type.name}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="text-sm text-gray-500">{type.description}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${type.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {type.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleEditChallengeType(type)}
                                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                                        >
                                                                            <Edit className="h-4 w-4"/>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteChallengeType(type.id)}
                                                                            className="text-red-600 hover:text-red-900"
                                                                        >
                                                                            <Trash2 className="h-4 w-4"/>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="4" className="text-center">No Challenge Types Found.</td>
                                                            </tr>
                                                        )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Interes Settings */}
                                    {activeTab === 'interes' && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                                <Award className="h-5 w-5 mr-2"/> Interes Settings
                                            </h2>

                                            <div className="mb-8">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-medium text-gray-800">Interes</h3>
                                                    {!showInteresForm && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowInteresForm(true)}
                                                            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1"/> Add New Interes
                                                        </button>
                                                    )}
                                                </div>

                                                {showInteresForm && (
                                                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                                                        <h4 className="text-md font-medium mb-3">
                                                            {editingInteres ? 'Edit Interes' : 'Add New Interes'}
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Interes Name*
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    value={newInteres.name}
                                                                    onChange={handleInteresChange}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="isActive"
                                                                        name="isActive"
                                                                        checked={newInteres.isActive}
                                                                        onChange={handleInteresChange}
                                                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                                                                    />
                                                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                                                        Active (Available for new interes)
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 flex justify-end space-x-3">
                                                            <button
                                                                type="button"
                                                                onClick={handleCancelInteres}
                                                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleAddOrUpdateInteres}
                                                                className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                                            >
                                                                {editingInteres ? 'Update Type' : 'Add Type'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Name
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                        {loadingInterests ? (
                                                            <tr>
                                                                <td colSpan="3" className="text-center">Loading...</td>
                                                            </tr>
                                                        ) : interestsData?.content && interestsData.content.length > 0 ? (
                                                            interestsData.content.map((type) => (
                                                                <tr key={type.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">{type.name}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${type.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {type.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleEditInteres(type)}
                                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                                        >
                                                                            <Edit className="h-4 w-4"/>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteInteres(type.id)}
                                                                            className="text-red-600 hover:text-red-900"
                                                                        >
                                                                            <Trash2 className="h-4 w-4"/>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="3" className="text-center">No Interes Found.</td>
                                                            </tr>
                                                        )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* System Settings */}
                                    {activeTab === 'system' && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                                <Database className="h-5 w-5 mr-2"/> System Maintenance
                                            </h2>
                                            {/* Nội dung System Settings giữ nguyên */}
                                        </div>
                                    )}

                                    {/* Save Button */}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center"
                                        >
                                            <Save className="h-4 w-4 mr-2"/> Save Settings
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Last updated: {new Date().toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1"/>
                                    Changes take effect immediately
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
