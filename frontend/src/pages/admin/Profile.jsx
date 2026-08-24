
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {

    const { setUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: ''
    });

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');


    // =====================================
    // Avatar URL
    // =====================================

    const getAvatarUrl = (avatarName) => {

        if (!avatarName) {
            return '';
        }

        return `http://localhost/php-lms-project/backend/uploads/avatars/${avatarName}`;
    };


    // =====================================
    // Fetch Profile
    // =====================================

    useEffect(() => {

        fetchProfile();

    }, []);


    const fetchProfile = async () => {

        try {

            const response = await api.get('/auth/me.php');

            if (response.data.status) {

                const profile = response.data.data.user;

                setFormData({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    bio: profile.bio || ''
                });

                setUser(profile);

                if (profile.avatar) {

                    setAvatarPreview(
                        getAvatarUrl(profile.avatar)
                    );

                }

            } else {

                setError(
                    response.data.message ||
                    'Failed to load profile'
                );

            }

        } catch (err) {

            console.error('Profile Fetch Error:', err);

            setError(
                err.response?.data?.message ||
                'Failed to load profile'
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================
    // Input Change
    // =====================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    // =====================================
    // Avatar Change
    // =====================================

    const handleAvatarChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }


        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];


        if (!allowedTypes.includes(file.type)) {

            setError(
                'Only JPG, PNG and WEBP images are allowed'
            );

            return;
        }


        if (file.size > 2 * 1024 * 1024) {

            setError(
                'Image size must be less than 2MB'
            );

            return;
        }


        setError('');
        setMessage('');

        setAvatar(file);


        const previewUrl =
            URL.createObjectURL(file);

        setAvatarPreview(previewUrl);

    };


    // =====================================
    // Submit Profile
    // =====================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setMessage('');
        setError('');


        try {

            const data = new FormData();


            data.append(
                'name',
                formData.name
            );

            data.append(
                'email',
                formData.email
            );

            data.append(
                'phone',
                formData.phone
            );

            data.append(
                'bio',
                formData.bio
            );


            if (avatar) {

                data.append(
                    'avatar',
                    avatar
                );

            }


            // IMPORTANT:
            // POST is used because PHP reads
            // $_POST and $_FILES.

            const response = await api.post(
                '/profile/update.php',
                data
            );


            if (response.data.status) {

                const updatedUser =
                    response.data.data.user;


                // Update AuthContext

                setUser(updatedUser);


                // Update localStorage

                localStorage.setItem(
                    'user',
                    JSON.stringify(updatedUser)
                );


                // Update form

                setFormData({
                    name: updatedUser.name || '',
                    email: updatedUser.email || '',
                    phone: updatedUser.phone || '',
                    bio: updatedUser.bio || ''
                });


                // Clear selected file

                setAvatar(null);


                // Update avatar

                if (updatedUser.avatar) {

                    setAvatarPreview(
                        getAvatarUrl(
                            updatedUser.avatar
                        )
                    );

                }


                setMessage(
                    response.data.message ||
                    'Profile updated successfully'
                );

            } else {

                setError(
                    response.data.message ||
                    'Failed to update profile'
                );

            }

        } catch (err) {

            console.error(
                'Profile Update Error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Failed to update profile'
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================
    // Loading
    // =====================================

    if (loading) {

        return (

            <div className="text-center py-5">

                <div
                    className="spinner-border text-primary"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading...
                    </span>

                </div>

            </div>

        );

    }


    // =====================================
    // UI
    // =====================================

    return (

        <div className="container-fluid">

            <div className="row justify-content-center">

                <div className="col-lg-8">

                    <div className="card shadow-sm border-0">

                        <div className="card-body p-4">


                            {/* Header */}

                            <div className="mb-4">

                                <h4 className="mb-1">
                                    My Profile
                                </h4>

                                <p className="text-muted mb-0">
                                    Manage your personal information
                                </p>

                            </div>


                            {/* Success Message */}

                            {message && (

                                <div className="alert alert-success">

                                    {message}

                                </div>

                            )}


                            {/* Error Message */}

                            {error && (

                                <div className="alert alert-danger">

                                    {error}

                                </div>

                            )}


                            <form onSubmit={handleSubmit}>


                                {/* =================================
                                    Avatar
                                ================================= */}

                                <div className="text-center mb-4">

                                    {avatarPreview ? (

                                        <img
                                            src={avatarPreview}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                objectFit: 'cover',
                                                border: '3px solid #eee'
                                            }}
                                        />

                                    ) : (

                                        <div
                                            className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                fontSize: '40px'
                                            }}
                                        >
                                            👤
                                        </div>

                                    )}


                                    <div className="mt-3">

                                        <label
                                            htmlFor="avatar"
                                            className="btn btn-outline-primary"
                                        >
                                            Change Photo
                                        </label>


                                        <input
                                            id="avatar"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="d-none"
                                            onChange={
                                                handleAvatarChange
                                            }
                                        />

                                    </div>


                                    <small className="text-muted d-block mt-2">
                                        JPG, PNG or WEBP — Maximum 2MB
                                    </small>

                                </div>


                                {/* =================================
                                    Name
                                ================================= */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* =================================
                                    Email
                                ================================= */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* =================================
                                    Phone
                                ================================= */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />

                                </div>


                                {/* =================================
                                    Bio
                                ================================= */}

                                <div className="mb-4">

                                    <label className="form-label">
                                        Bio
                                    </label>

                                    <textarea
                                        name="bio"
                                        className="form-control"
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleChange}
                                    />

                                </div>


                                {/* =================================
                                    Buttons
                                ================================= */}

                                <div className="d-flex gap-2">

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >

                                        {saving
                                            ? 'Saving...'
                                            : 'Save Changes'
                                        }

                                    </button>


                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            navigate(
                                                '/admin/dashboard'
                                            )
                                        }
                                    >
                                        Back
                                    </button>

                                </div>


                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Profile;

