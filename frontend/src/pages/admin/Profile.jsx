import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Sidebar from '../../components/common/Sidebar';

const Profile = () => {

    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: ''
    });

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const getAvatarUrl = (avatarName) => {

        if (!avatarName) {
            return '';
        }

        return `http://localhost/php-lms-project/backend/uploads/avatars/${avatarName}`;
    };

    useEffect(() => {

        if (!user) {
            return;
        }

        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || ''
        });

        if (user.avatar) {
            setAvatarPreview(
                getAvatarUrl(user.avatar)
            );
        }

    }, [user]);

    const fetchProfile = async () => {

        try {

            const response = await api.get(
                '/auth/me.php'
            );

            if (response.data.status) {

                const profile =
                    response.data.data?.user;

                if (!profile) {
                    return;
                }

                setUser(profile);

                setFormData({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    bio: profile.bio || ''
                });

                if (profile.avatar) {

                    setAvatarPreview(
                        getAvatarUrl(
                            profile.avatar
                        )
                    );

                }

            }

        } catch (err) {

            console.error(
                'Profile Fetch Error:',
                err
            );

        }

    };

    useEffect(() => {

        if (user) {
            fetchProfile();
        }

    }, []);

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };

    const handleAvatarChange = (e) => {

        const file =
            e.target.files?.[0];

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

            const response =
                await api.post(
                    '/profile/update.php',
                    data
                );

            if (response.data.status) {

                const updatedUser =
                    response.data.data.user;

                setUser(updatedUser);

                localStorage.setItem(
                    'user',
                    JSON.stringify(updatedUser)
                );

                setFormData({
                    name:
                        updatedUser.name || '',
                    email:
                        updatedUser.email || '',
                    phone:
                        updatedUser.phone || '',
                    bio:
                        updatedUser.bio || ''
                });

                setAvatar(null);

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

    return (

        <div className="d-flex flex-column min-vh-100">

            <Header />

            <div className="d-flex flex-grow-1">

                <Sidebar />

                <main className="flex-grow-1">

                    <div className="container-fluid py-4">

                        <div className="row justify-content-center">

                            <div className="col-lg-8">

                                <div className="card shadow-sm border-0">

                                    <div className="card-body p-4">

                                        <div className="mb-4">

                                            <h4 className="mb-1">
                                                My Profile
                                            </h4>

                                            <p className="text-muted mb-0">
                                                Manage your personal information
                                            </p>

                                        </div>

                                        {message && (

                                            <div className="alert alert-success">
                                                {message}
                                            </div>

                                        )}

                                        {error && (

                                            <div className="alert alert-danger">
                                                {error}
                                            </div>

                                        )}

                                        <form onSubmit={handleSubmit}>

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

                </main>

            </div>

            <Footer />

        </div>

    );
};

export default Profile;