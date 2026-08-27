
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';


const Register = () => {

    // =====================================
    // FORM
    // =====================================

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });


    // =====================================
    // STATES
    // =====================================

    const [error, setError] = useState('');

    const [success, setSuccess] = useState('');

    const [loading, setLoading] = useState(false);


    const { register } = useAuth();

    const navigate = useNavigate();


    // =====================================
    // HANDLE CHANGE
    // =====================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };


    // =====================================
    // SUBMIT
    // =====================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError('');

        setSuccess('');

        setLoading(true);


        try {

            const res = await register(
                form.name,
                form.email,
                form.password,
                form.role
            );


            if (res?.status) {

                setSuccess(
                    'Registration successful! Please login.'
                );


                setTimeout(() => {

                    navigate('/login');

                }, 1500);


            } else {

                setError(
                    res?.message ||
                    'Registration failed'
                );

            }


        } catch (err) {

            console.error(
                'Registration error:',
                err
            );


            setError(
                err.response?.data?.message ||
                'Something went wrong while registering'
            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // PAGE
    // =====================================

    return (

        <div className="d-flex flex-column min-vh-100">

            <Header />


            <div className="container my-5 flex-grow-1">

                <div className="row justify-content-center">

                    <div className="col-md-5">

                        <div className="card shadow border-0">

                            <div className="card-body p-4">

                                <h3 className="text-center mb-4">
                                    Register
                                </h3>


                                {/* ERROR */}

                                {error && (

                                    <div className="alert alert-danger">

                                        <i className="bi bi-exclamation-triangle me-2"></i>

                                        {error}

                                    </div>

                                )}


                                {/* SUCCESS */}

                                {success && (

                                    <div className="alert alert-success">

                                        <i className="bi bi-check-circle me-2"></i>

                                        {success}

                                    </div>

                                )}


                                {/* FORM */}

                                <form onSubmit={handleSubmit}>


                                    {/* NAME */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                            minLength={3}
                                        />

                                    </div>


                                    {/* EMAIL */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            required
                                        />

                                    </div>


                                    {/* PASSWORD */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                            minLength={6}
                                        />

                                    </div>


                                    {/* ROLE */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Register as
                                        </label>

                                        <select
                                            name="role"
                                            className="form-select"
                                            value={form.role}
                                            onChange={handleChange}
                                            required
                                        >

                                            <option value="student">
                                                Student
                                            </option>

                                            <option value="teacher">
                                                Teacher
                                            </option>

                                            <option value="admin">
                                                Admin
                                            </option>

                                        </select>

                                    </div>


                                    {/* REGISTER BUTTON */}

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >

                                        {loading ? (

                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>

                                                Registering...
                                            </>

                                        ) : (

                                            'Register'

                                        )}

                                    </button>


                                </form>


                                {/* LOGIN */}

                                <p className="text-center mt-3 mb-0">

                                    Already have an account?{' '}

                                    <Link to="/login">
                                        Login
                                    </Link>

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <Footer />

        </div>

    );

};


export default Register;

