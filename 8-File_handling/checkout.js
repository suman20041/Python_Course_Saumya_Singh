import Footer from '@/components/Footer/Footer'
import styles from '../styles/checkout.module.scss'
import Header from '@/components/Header/Header'
import Link from 'next/link'
import Image from 'next/image'
import { Button, Modal } from 'react-bootstrap'
import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { signIn, useSession } from 'next-auth/react'
import { instance } from '@/utils/Apiconfig'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Country } from 'country-state-city'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { generateOTP, encodeOTP } from './login/otp-verification'
import moment from 'moment'
import bcrypt from 'bcryptjs'
export default function Checkout() {
    const [expiryDate, setExpiryDate] = useState('');
    const [error, setError] = useState('');

    const handleExpiryDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value.length > 4) return;

        if (value.length >= 2) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        }

        setExpiryDate(value);
        validateExpiryDate(value);
    };

    const validateExpiryDate = (value) => {
        if (value.length !== 5) {
            setError("Invalid format (MM/YY)");
            return;
        }

        const [month, year] = value.split("/").map(num => parseInt(num, 10));
        if (month < 1 || month > 12) {
            setError("Invalid month");
            return;
        }

        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            setError("Card is expired");
        } else {
            setError("");
        }
    };

    const { status, data: session } = useSession();
    const router = useRouter();
    const [addressList, setAddressList] = useState([]);
    const [cart, setCart] = useState(null);
    const [selectedBillingId, setSelectedBillingId] = useState(null);
    const [selectedShippingId, setSelectedShippingId] = useState(null);
    const [showForm, setShowForm] = useState(true);
    const [loading, setLoading] = useState(true);
    const [acceptPolicy, setAcceptPolicy] = useState(false);
    const [emailModal, setEmailModal] = useState(false);
    const [otpModal, setOtpModal] = useState(false);
    const otpContainerRef = useRef(null);
    const [otp, setOTP] = useState('')
    const [timer, setTimer] = useState(10000);
    const [email, setEmail] = useState('')
    const [totalData, setTotalData] = useState({
        shipping: 0,
        subTotal: 0,
        tax: 0,
        discount: 0,
        grandTotal: 0,
        reward: 0,
        advancedPaymentDiscount: 0,
        vat: 0
    });
    const [orderNotes, setOrderNotes] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [reward, setReward] = useState({
        is_elegible: false,
        percentage: 0,
        totalRewards: 0,
        claimRewards: 0
    })

    const formik = useFormik({
        initialValues: {
            billingAddress: {
                fullname: "",
                email: "",
                phone: "",
                address: "",
                locality: "",
                pincode: "",
                country: "",
                order_note: "",
                address_type: "Billing",
            },
            shippingAddress: {
                fullname: "",
                email: "",
                phone: "",
                address: "",
                locality: "",
                pincode: "",
                country: "",
                order_note: "",
                address_type: "Shipping",
            },
            sameAsBilling: true,
        },
        validationSchema: Yup.object({
            sameAsBilling: Yup.boolean(),
            billingAddress: Yup.object({
                fullname: Yup.string().required("Full Name is required!"),
                email: Yup.string().email("Email is invalid").required("Email is required!"),
                phone: Yup.number('Phone must be a number.').required("Phone is required!"),
                address: Yup.string().required("Address is required!"),
                locality: Yup.string().required("Locality is required!"),
                pincode: Yup.string().required("Pincode is required!"),
                country: Yup.string().required("Country is required!"),
                address_type: Yup.string().required("Address Type is required!"),
            }),
            shippingAddress: Yup.object().shape({
                fullname: Yup.string().when('$sameAsBilling', {
                    is: false,
                    then: (schema) => schema.required("Full Name is required!")
                }),
                email: Yup.string().when('$sameAsBilling', {
                    is: false,
                    then: (schema) => schema.email("Email is invalid").required("Email is required!")
                }),
                phone: Yup.number().typeError("Phone must be a number").when('$sameAsBilling', {
                    is: false,
                    then: (schema) => schema.required("Phone is required!")
                }),
                address: Yup.string().when('$sameAsBilling', {
                    is: false,
                    then: (schema) => schema.required("Address is required!")
                }),
                locality: Yup.string().when('$sameAsBilling', {
                    is: false,
                    then: (schema) => schema.required("Locality is required!")
                }),
                pincode: Yup.string().when('$sameAsBilling', {
                    is: false,
                    then: (schema) => schema.required("Pincode is required!")
                }),
                country: Yup.string().when('$sameAsBilling', {
                    is: false,
                    then: (schema) => schema.required("Country is required!")
                }),
                address_type: Yup.string().when('$sameAsBilling', {
                    is: false,
                    then: (schema) => schema.required("Address Type is required!")
                }),
                otherwise: Yup.object().notRequired(),
            }),
        }),
        onSubmit: async () => {
            if (status === "authenticated") {
                if (showForm === "add") {
                    if (session && session.user?.id) {
                        let toastId = toast.loading("Saving Address details...");
                        let reqData = {
                            fullname: formik.values.billingAddress.fullname,
                            email: formik.values.billingAddress.email,
                            address: formik.values.billingAddress.address,
                            address_type: formik.values.billingAddress.address_type,
                            country: formik.values.billingAddress.country,
                            locality: formik.values.billingAddress.locality,
                            order_note: formik.values.billingAddress.order_note,
                            phone: formik.values.billingAddress.phone,
                            pincode: formik.values.billingAddress.pincode,
                            user_id: session.user?.id
                        }
                        await instance.post(`/api/address`, reqData);
                        if (formik.values.sameAsBilling) {
                            reqData.address_type = "Shipping";
                            await instance.post(`/api/address`, reqData);
                        } else {
                            let reqData = {
                                fullname: formik.values.shippingAddress.fullname,
                                email: formik.values.shippingAddress.email,
                                address: formik.values.shippingAddress.address,
                                address_type: formik.values.shippingAddress.address_type,
                                country: formik.values.shippingAddress.country,
                                locality: formik.values.shippingAddress.locality,
                                order_note: formik.values.shippingAddress.order_note,
                                phone: formik.values.shippingAddress.phone,
                                pincode: formik.values.shippingAddress.pincode,
                                user_id: session.user?.id
                            }
                            await instance.post(`/api/address`, reqData);
                        }
                        getCart();
                        toast.update(toastId, { render: "Address details Saved.", type: "success", autoClose: true, closeOnClick: true, isLoading: false });
                        // Error while saving address details.
                    }
                } else {
                    let reqData = {
                        fullname: formik.values.billingAddress.fullname,
                        email: formik.values.billingAddress.email,
                        address: formik.values.billingAddress.address,
                        address_type: formik.values.billingAddress.address_type,
                        country: formik.values.billingAddress.country,
                        locality: formik.values.billingAddress.locality,
                        order_note: formik.values.billingAddress.order_note,
                        phone: formik.values.billingAddress.phone,
                        pincode: formik.values.billingAddress.pincode,
                        user_id: session.user?.id
                    }
                    await toast.promise(instance.put(`/api/address?id=${showForm}`, reqData),
                        {
                            pending: 'Saving Address details...',
                            success: 'Address details Updated.',
                            error: 'Error while Updating address details.',
                        });
                    getCart();
                }
                setShowForm(false);
            } else {
                proceedToCheckout();
            }
        }
    })

    const [selectedPayment, setSelectedPayment] = useState("");

    const handlePaymentChange = (event, advancedPayment) => {
        setSelectedPayment(event.target.value);
        calculateSubTotal(cart, totalData.reward, advancedPayment, false)
    };

    const proceedToCheckout = async (checkAddress = null) => {
        if (showForm === 'add' && checkAddress) {
            await formik.submitForm();
            return;
        } else {
            if (!selectedPayment) {
                toast.error("Please select a payment method.");
                return;
            }
            if (acceptPolicy) {
                if (session?.user?.id) {
                    if (selectedBillingId && selectedShippingId) {
                        let toastID = toast.loading("Preparing your order...");
                        let reqData = {
                            ...cart,
                            billingAddress: addressList.filter((addr) => addr._id === selectedBillingId)[0],
                            shippingAddress: addressList.filter((addr) => addr._id === selectedShippingId)[0],
                            paymentMethod: selectedPayment,
                            reward: totalData.reward,
                            advancedPaymentDiscount: totalData.advancedPaymentDiscount,
                            shipping: totalData.shipping,
                            vat: totalData.vat,
                            paymentStatus: "pending",
                            orderRewards: Math.ceil(parseFloat(totalData.grandTotal) * 0.03),
                            total_order_value: totalData.grandTotal,
                            orderNotes: orderNotes
                        }
                        delete reqData._id;

                        await instance.delete(`/api/cart?id=${session?.user?.id}`);
                        let res = await instance.post(`/api/orders`, reqData);
                        localStorage.removeItem("guest_user_id");
                        if (cart.coupon) {
                            await instance.put(`/api/coupon_used`, { coupon_id: cart.coupon._id, user_id: session?.user?.id, order_id: res.insertedId });
                        }
                        if (res.data) {
                            toast.update(toastID, { render: "Order Created.", isLoading: false, type: "success", closeOnClick: true, autoClose: true });
                            if (selectedPayment != "contractual") {
                                let orderReq = {
                                    invoice_id: res.data.insertedId,
                                    mobileNo: reqData.billingAddress.phone,
                                    amount: (totalData.grandTotal + totalData.vat).toString(),
                                    emailId: reqData.billingAddress.email,
                                    addlNote1: session?.user?.id, // User ID
                                    addlNote2: res.data.insertedId, // order ID
                                    addlNote3: "",
                                    addlNote4: "",
                                    requestId: res.data.insertedId,
                                }
                                try {
                                    let paymentRes = await instance.post("/api/createPaymentOrder", orderReq);
                                    if (paymentRes.status === 200) {
                                        window.location.href = paymentRes.data.order.SMSLink;
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            } else {
                                let rewardReq = {
                                    order_id: res.data.insertedId,
                                    user_id: session?.user?.id,
                                    total_amount: totalData.grandTotal,
                                    reward_count: Math.ceil(parseFloat(totalData.grandTotal) * 0.03),
                                    is_redeemed: false
                                }
                                await instance.post(`/api/reward`, rewardReq);
                                router.push(`/thankyou?orderid=${res.data.insertedId}`);
                            }

                        } else {
                            toast.update(toastID, { render: "Error while order preparing.", isLoading: false, type: "error", closeOnClick: true, autoClose: true });
                        }
                    } else {
                        toast.error("Select Billing and Shipping Address.");
                    }
                } else {
                    let toastID = toast.loading("Checking order information...");
                    try {
                        let checkEmail = await instance.get(`/api/users?email=${email}`);
                        if (checkEmail.data && checkEmail.data.length != 0) {
                            setEmailModal(true);
                            toast.dismiss(toastID);
                            return;
                        }
                    } catch (error) {
                        if (error.response) {
                            if (error.response.status === 404) {
                                toast.dismiss(toastID);
                                handleCheckoutFlow()
                            }

                        }
                    }

                }
            }
            else {
                toast.error("Please accept the terms and conditions.")
            }
        }
    }
    const handleCheckoutFlow = async (uid = null) => {
        let toastID = toast.loading("Preparing your order...");
        if (!uid) {
            let reqData = {
                profile_image: null,
                fullname: formik.values.billingAddress.fullname,
                email: formik.values.billingAddress.email,
                phone: formik.values.billingAddress.phone,
                organization_name: null,
                tax_registration_number: null,
                password: "",
            }
            let res = await instance.post(`/api/users`, reqData);
            uid = res.data.insertedId;
        }
        // let cartData = { ...cart };
        // cartData.user_id = res.data.insertedId;
        // let cartId = cartData._id;
        // delete cartData._id;
        // await instance.put(`/api/cart?id=${cartId}`, cartData);
        let cartProducts = cart.products.filter((p) => p.product_id);
        cartProducts.forEach(async (product) => {
            let reqData = { ...product };
            delete reqData._id;
            delete reqData.productTotal;
            delete reqData.product_img;
            delete reqData.product_name;
            delete reqData.totalPrice;
            delete reqData.quantity;
            delete reqData.view;
            delete reqData.price;
            delete reqData.subTotal;
            await instance.put(`/api/user_default_prefs?uid=${uid}&pid=${product.product_id}`, { ...reqData, user_id: uid })
        });
        let billingReqData = {
            fullname: formik.values.billingAddress.fullname,
            email: formik.values.billingAddress.email,
            address: formik.values.billingAddress.address,
            address_type: formik.values.billingAddress.address_type,
            country: formik.values.billingAddress.country,
            locality: formik.values.billingAddress.locality,
            order_note: formik.values.billingAddress.order_note,
            phone: formik.values.billingAddress.phone,
            pincode: formik.values.billingAddress.pincode,
            user_id: uid
        };
        let shippingReqData = billingReqData;
        await instance.post(`/api/address`, billingReqData);
        if (formik.values.sameAsBilling) {
            shippingReqData.address_type = "Shipping";
            await instance.post(`/api/address`, shippingReqData);
        } else {
            shippingReqData = {
                fullname: formik.values.shippingAddress.fullname,
                email: formik.values.shippingAddress.email,
                address: formik.values.shippingAddress.address,
                address_type: formik.values.shippingAddress.address_type,
                country: formik.values.shippingAddress.country,
                locality: formik.values.shippingAddress.locality,
                order_note: formik.values.shippingAddress.order_note,
                phone: formik.values.shippingAddress.phone,
                pincode: formik.values.shippingAddress.pincode,
                user_id: uid
            }
            await instance.post(`/api/address`, shippingReqData);
        }
        let orderReqData = {
            ...cart,
            billingAddress: billingReqData,
            shippingAddress: shippingReqData,
            paymentMethod: selectedPayment,
            user_id: uid,
            reward: totalData.reward,
            advancedPaymentDiscount: totalData.advancedPaymentDiscount,
            paymentStatus: "pending",
            orderRewards: Math.ceil(parseFloat(totalData.grandTotal) * 0.03),
            shipping: totalData.shipping,
            total_order_value: totalData.grandTotal,
            vat: totalData.vat,
            orderNotes: orderNotes
        }
        delete orderReqData._id;

        await instance.delete(`/api/cart?id=${localStorage.getItem("guest_user_id")}`);
        let orderRes = await instance.post(`/api/orders`, orderReqData);
        localStorage.removeItem("guest_user_id");
        if (cart.coupon) {
            await instance.put(`/api/coupon_used`, { coupon_id: cart.coupon._id, user_id: uid, order_id: orderRes.insertedId });
        }
        if (orderRes.data) {
            toast.update(toastID, { render: "Order Created.", isLoading: false, type: "success", closeOnClick: true, autoClose: true });
            // let pgToken = await instance.get("/api/getPGToken");
            let orderReq = {
                invoice_id: orderRes.data.insertedId,
                mobileNo: formik.values.billingAddress.phone,
                amount: (totalData.grandTotal + totalData.vat).toString(),
                emailId: formik.values.billingAddress.email,
                addlNote1: uid, // User ID
                addlNote2: orderRes.data.insertedId, // order ID
                addlNote3: "",
                addlNote4: "",
                requestId: orderRes.data.insertedId,
            }
            try {
                let paymentRes = await instance.post("/api/createPaymentOrder", orderReq);
                if (paymentRes.status === 200) {
                    window.location.href = paymentRes.data.order.SMSLink;
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            toast.update(toastID, { render: "Error while order preparing.", isLoading: false, type: "error", closeOnClick: true, autoClose: true });
        }
    }

    const calculateSubTotal = async (data, reward = 0, advancedPaymentDiscount = false, shippingCharge = false) => {
        let discountAmt = 0;
        let netAmount = 0; // This is the base for VAT
        let shipping = 0;
        let paymentDiscountForPayment = 0;
        let couponData = null;
        let cartData = { ...data };

        let total = cartData.products.reduce((acc, value) => acc + parseFloat(value.subTotal), 0);

        if (cartData.products && cartData.products.length !== 0) {
            if (cartData.coupon) {
                if (cartData.coupon.discount_type === "%") {
                    let discount = total * cartData.coupon.value / 100;
                    discountAmt = discount;
                    netAmount = total - discount;
                    couponData = cartData.coupon;
                } else {
                    discountAmt = cartData.coupon.value;
                    netAmount = total - cartData.coupon.value;
                    couponData = cartData.coupon;
                }
            } else {
                discountAmt = 0;
                netAmount = total;
                couponData = data.coupon;
            }

            // Apply Reward
            let rewardAmount = parseFloat(reward) || 0;

            // Apply Advanced Payment Discount
            if (advancedPaymentDiscount !== false) {
                paymentDiscountForPayment = parseFloat((netAmount * advancedPaymentDiscount) / 100).toFixed(2);
            } else {
                paymentDiscountForPayment = totalData.advancedPaymentDiscount || 0;
            }

            netAmount = netAmount - rewardAmount - parseFloat(paymentDiscountForPayment);
        } else {
            netAmount = 0;
        }

        // Calculate Shipping
        if (shippingCharge !== false) {
            shipping = (netAmount * shippingCharge) / 100;
        } else {
            if (showForm) {
                let country = formik.values.sameAsBilling
                    ? formik.values.billingAddress.country
                    : formik.values.shippingAddress.country || "";
                let shippingPercentage = country === "United Arab Emirates" || country === "" ? 0 : 5;
                shipping = (netAmount * shippingPercentage) / 100;
            } else {
                if (selectedShippingId) {
                    let addr = addressList.find((add) => add._id === selectedShippingId);
                    if (addr) {
                        let shippingPercentage = addr.country === "United Arab Emirates" ? 0 : 5;
                        shipping = (netAmount * shippingPercentage) / 100;
                    }
                }
            }
        }

        // Now calculate VAT on (Net Amount + Shipping)
        let vat = parseFloat(((netAmount + shipping) * 5) / 100).toFixed(2);

        // Final Grand Total
        let grandTotal = netAmount + shipping + parseFloat(vat);

        setTotalData({
            ...totalData,
            discount: parseFloat(discountAmt).toFixed(2),
            shipping: parseFloat(shipping).toFixed(2),
            subTotal: parseFloat(total).toFixed(2),
            tax: 0,
            grandTotal: parseFloat(netAmount + shipping).toFixed(2), // Total before VAT
            vat: vat,
            couponData: couponData,
            reward: parseFloat(reward || 0),
            advancedPaymentDiscount: parseFloat(paymentDiscountForPayment || 0)
        });

        setCouponCode(couponData?.code || "");

        // Update cart with coupon
        delete cartData._id;
        cartData.coupon = couponData;
        await instance.put("/api/cart", cartData);
    };
    const getCart = async (uid = null) => {
        if (!uid) {
            if (status === "unauthenticated") {
                uid = localStorage.getItem("guest_user_id");
            } else {
                uid = session?.user?.id;
                if (uid) {
                    let checkReward = await instance.get(`/api/reward?checkRedeem=1&user_id=${uid}`);
                    if (checkReward.data) {
                        setReward({
                            is_elegible: checkReward.data.percentage > 50,
                            ...checkReward.data
                        })
                    }
                }

            }
        }
        if (uid) {
            instance.get(`/api/cart?uid=${uid}`).then((res) => {
                if (res.data && res.data.length != 0) {
                    let data = res.data[0];
                    data.products = data.products.map((p) => {
                        return { ...p, view: false, quantity: p.quantity || 1, subTotal: p.productTotal * (p.quantity || 1) || p.price * (p.quantity || 1) }
                    })
                    setCart(data);
                    calculateSubTotal(data, totalData.reward, totalData.advancedPaymentDiscount, totalData.shipping);
                }
                setLoading(false);
            })
            instance.get(`/api/address?user_id=${uid}`).then((res) => {
                if (res.data && res.data.length != 0) {
                    setAddressList(res.data);
                    setShowForm(false);
                } else {
                    setShowForm('add');
                }
            })
        }
    }


    const handleRemove = async (id) => {
        await instance.delete(`/api/address?id=${id}`);
        getCart();
    };

    const handleEdit = (data) => {
        setShowForm(data._id);
        formik.setFieldValue("billingAddress", data);
    };

    useEffect(() => {
        getCart();
    }, [status])

    const handleInputChange = (index, e) => {
        const value = e.target.value;
        const newOTP = otp.slice(0, index) + value + otp.slice(index + 1);
        setOTP(newOTP);

        if (value && index < 3) {
            const inputFields = otpContainerRef.current.querySelectorAll('input');
            inputFields[index + 1]?.focus();
        }
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        let res = await instance.post("/api/emailcheck", { email: email });
        if (res.data.exists) {
            const OTP = generateOTP();
            const otpConfig = {
                to: email,
                subject: `Your One Time Password is ${OTP} for Account Recovery`,
                html: `Your One Time Password is ${OTP} for Account Recovery`,
            };
            const sendotp = await toast.promise(instance.post('/api/email', otpConfig), {
                success: "Otp has been sent to your email",
                error: "An error occurs while sending otp",
                pending: "Sending OTP to your email address"
            });
            const hashedotp = await encodeOTP(OTP)
            const storeotp = instance.put(`/api/otp_verification?email=${email}`, { otp: hashedotp }).then(res => {
                setEmailModal(false)
                setOtpModal(true)
                countDown();
            })
        }
        else {
            toast.error("error");
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        const toastID = toast.loading("Verifying...")
        const verifyotp = await instance.get(`/api/otp_verification?email=${email}`).then(async (res) => {
            if (res.data.otp) {
                const isCorrect = await bcrypt.compare(otp, res.data.otp)
                if (isCorrect) {
                    const deleteotp = await instance.delete(`/api/otp_verification?email=${email}`).then(async () => {
                        let response = await instance.get(`/api/users?email=${email}`);
                        if (response.data) {
                            setOtpModal(false)
                            toast.update(toastID, { render: "Otp is verified!", type: "success", isLoading: false, autoClose: true })
                            await handleCheckoutFlow(response.data._id);
                        }
                    })
                } else {
                    toast.update(toastID, { render: "OTP is invalid!!!", type: "error", isLoading: false, autoClose: true })
                    setOTP('');
                }

            }
            else {
                toast.error("OTP is invalid!!!")
                setOTP('');
            }
        })
    };
    const countDown = () => {
        let seconds = 60 * 1
        setTimer(seconds);
        const interval = setInterval(() => {
            seconds -= 1;
            setTimer(seconds);
            if (seconds <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    }


    const invalidateOTP = async () => {
        try {
            const response = await instance.delete(`/api/otp_verification?email=${email}`);
            if (response.status === 200) {
                toast.error("OTP has expired!");
                setOTP('');
            } else {
                toast.error(" Please try again.");
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                toast.error("OTP was already expired or does not exist.");
                setOTP('');
            } else {
                toast.error("An unexpected error occurred while invalidating OTP.");
            }
        }
    };
    useEffect(() => {
        if (timer === 0) {
            invalidateOTP();
        }
    }, [timer]);
    function seconds(seconds) {
        const duration = moment.duration(seconds, 'seconds');
        return moment.utc(duration.asMilliseconds()).format('mm:ss');
    }
    const [disableRedeem, setDisableRedeem] = useState(false)

    const redeemReward = () => {
        const toastID = toast.loading("Processing...")
        setDisableRedeem(true)
        calculateSubTotal(cart, reward.claimRewards, false, false);
        toast.update(toastID, { render: "Reward Claimed!", type: "success", isLoading: false, autoClose: true })
    }

    const decideShippingCharge = (grandTotal) => {
        if (showForm) {
            if (formik.values.sameAsBilling) {
                let country = formik.values.billingAddress.country;
                let shippingPercentage = country === "United Arab Emirates" || country === "" ? 0 : 5;
                let percentage = (grandTotal * shippingPercentage) / 100;
                return percentage;
            } else {
                let country = formik.values.shippingAddress.country;
                let shippingPercentage = country === "United Arab Emirates" || country === "" ? 0 : 5;
                let percentage = (grandTotal * shippingPercentage) / 100;
                return percentage;
            }
        } else {
            if (selectedShippingId) {
                let addr = addressList.filter((add) => add._id === selectedShippingId);
                if (addr.length != 0) {
                    let country = addr[0].country;
                    let shippingPercentage = country === "United Arab Emirates" ? 0 : 5;
                    let percentage = (grandTotal * shippingPercentage) / 100;
                    return percentage;
                }
            } else {
                return 0;
            }
        }
    }

    const applyCoupon = async () => {
        if (couponCode) {
            let res = await instance.get(`/api/coupon?couponCode=${couponCode}`)
            if (res.data) {
                if (res.data.end_date && moment(res.data.end_date).isBefore(moment())) {
                    toast.error("Coupon is not available");
                    setCouponCode("");
                    return;
                }
                let uid = null;
                if (status === "unauthenticated") {
                    uid = localStorage.getItem("guest_user_id");
                } else {
                    uid = session?.user?.id;
                }
                if (res.data.one_time_use) {
                    let checkOnce = await instance.get(`/api/coupon_used?coupon_id=${res.data._id}&user_id=${uid}`);
                    if (checkOnce.data != 0) {
                        setCouponCode("");
                        toast.error("Coupon Already Used.")
                        return;
                    }
                }
                if (cart.products && cart.products.length != 0) {
                    if (res.data.discount_type === "%") {
                        let discount = totalData.subTotal * res.data.value / 100;
                        let shipping = decideShippingCharge(((totalData.subTotal - discount) - (totalData.reward + totalData.advancedPaymentDiscount)));
                        let total = ((totalData.subTotal - discount) - (totalData.reward + totalData.advancedPaymentDiscount)) + shipping;
                        let vatAmount = (total * 5) / 100; // VAT from final total

                        setTotalData({
                            ...totalData,
                            grandTotal: total,
                            vat: vatAmount,
                            discount: discount,
                            couponData: res.data,
                            shipping: shipping
                        })
                        setCart({
                            ...cart,
                            coupon: res.data
                        })
                        toast.success("Coupon Applied.");
                    } else {
                        let shipping = decideShippingCharge(((totalData.subTotal - parseFloat(res.data.value)) - (totalData.reward + totalData.advancedPaymentDiscount)))
                        let total = ((totalData.subTotal - parseFloat(res.data.value)) - (totalData.reward + totalData.advancedPaymentDiscount)) + shipping;
                        let vatAmount = (total * 5) / 100; // VAT from final total

                        setTotalData({
                            ...totalData,
                            grandTotal: total,
                            vat: vatAmount,
                            discount: res.data.value,
                            couponData: res.data,
                            shipping: shipping
                        })
                        setCart({
                            ...cart,
                            coupon: res.data
                        })
                        toast.success("Coupon Applied.")
                    }
                }
            } else {
                toast.error("Invalid Coupon.")
            }
        } else {
            toast.error("Enter Coupon Code.");
        }
    }
    const deleteProduct = async (item) => {
        const toastID = toast.loading("Removing Product...");
        const filterData = cart.products.filter((_, index) => index !== item);
        let reqData = {
            products: filterData
        }
        if (filterData.length === 0) {
            reqData = {
                ...reqData,
                coupon: null
            }
        }
        instance.put(`/api/cart?id=${cart._id}`, { ...reqData }).then((res) => {
            getCart()
            toast.update(toastID, { render: "Product Removed.", isLoading: false, type: "success", closeOnClick: true, autoClose: true });
        })
    }

    const handleAddressCountryChange = (e, type) => {
        if (type === "billing") {
            let shippingPercentage = e.target.value === "United Arab Emirates" ? 0 : 5;
            calculateSubTotal(cart, totalData.reward, false, shippingPercentage);
        } else if (type === "sameAsBilling") {
            let country = e.target.checked ? formik.values.billingAddress.country : (formik.values.shippingAddress.country ? formik.values.shippingAddress.country : "");
            if (country) {
                let shippingPercentage = country === "United Arab Emirates" ? 0 : 5;
                calculateSubTotal(cart, totalData.reward, false, shippingPercentage);
            } else {
                calculateSubTotal(cart, totalData.reward, false, 0);
            }
        } else if (type === "shipping") {
            let shippingPercentage = e.target.value === "United Arab Emirates" ? 0 : 5;
            calculateSubTotal(cart, totalData.reward, false, shippingPercentage);
        } else if (type === "selection") {
            let shippingPercentage = e === "United Arab Emirates" ? 0 : 5;
            calculateSubTotal(cart, totalData.reward, false, shippingPercentage);
        }
    }

    return (
        <>
            <Head>
                <title>Checkout  | Future Glass </title>
                <link rel="canonical" href="https://devwebsite.faglass.com/checkout" />
                <meta name="description" content="Complete your order by providing your details and confirming your payment on the Future Architecture Glass." />
                <meta name="image" content="/images/meta/checkout-meta-img.jpg" />
                <meta itemProp="name" content="Checkout | Future Architecture Glass" />
                <meta itemProp="description" content="Complete your order by providing your details and confirming your payment on the Future Architecture Glass." />
                <meta itemProp="image" content="/images/meta/checkout-meta-img.jpg" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Checkout | Future Architecture Glass" />
                <meta name="twitter:description" content="Complete your order by providing your details and confirming your payment on the Future Architecture Glass." />
                <meta name="twitter:image:src" content="/images/meta/checkout-meta-img.jpg" />
                <meta name="keywords" content="account dashboard, rewards tracking, wishlist management, order history, user profile, Future Architecture Glass, fire-rated glass solutions, customer dashboard, account overview, manage rewards" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="og:title" content="Checkout | Future Architecture Glass" />
                <meta name="og:description" content="Complete your order by providing your details and confirming your payment on the Future Architecture Glass." />
                <meta name="og:image" content="/images/meta/checkout-meta-img.jpg" />
                <meta name="og:url" content="https://devwebsite.faglass.com/checkout" />
                <meta name="og:site_name" content="FutureGlass" />
                <meta name="og:locale" content="en_US" />
                <meta name="og:type" content="article" />
                <meta name="title" property="og:title" content="Checkout | Future Architecture Glass" />
                <meta name="image" property="og:image" content="/images/meta/checkout-meta-img.jpg" />
                <meta name="author" content="Future Glass" />
            </Head>
            <Header />
            <main className={styles.checkout}>
                <div className="custom-container">
                    <div className={styles.steps}>
                        <Link href='/cart' className={false ? styles.active : ''}>Cart</Link>
                        <span className={styles.line}></span>
                        <span className={true ? styles.active : ''}>Checkout</span>
                        <span className={styles.line}></span>
                        <span className={false ? styles.active : ''}>Payment</span>
                    </div>
                    {!showForm && !loading && cart && cart.products.length > 0 && <div className={styles.head}>
                        <h2 className={styles.heading}>Select Delivery Address</h2>
                        <Button className={`${styles.btn} ${styles.update}`} onClick={() => { setShowForm("add"); formik.resetForm() }}>Add Address</Button>
                    </div>}
                    {
                        loading && <div className={styles.loadingContainer} data-aos="fade-in">
                            <img src="/images/loader.gif" height={100} width={100} alt="loader" />
                            <p className={styles.carttext}>Loading cart...</p>
                        </div>
                    }
                    {!loading && cart && cart.products.length > 0 ? <div className={styles.wrapper}>

                        <div className={styles.addressList}>
                            {/* address listing*/}
                            {!showForm && <><div className={styles.billigAddress}>
                                <h4 className={styles.title}>Billing Address</h4>
                                <div className={styles.addBox}>
                                    <div className={styles.flexContainer}>
                                        {addressList.filter((addr) => addr.address_type === "Billing").map((item) => (
                                            <label className="radio-button-container" key={item.id}>
                                                <div className={styles.box}>
                                                    <div className={styles.name}>
                                                        <div className={styles.radio}>
                                                            <input
                                                                type="radio"
                                                                name="billing"
                                                                checked={selectedBillingId === item._id}
                                                                onChange={() => setSelectedBillingId(item._id)}
                                                            />
                                                            <span className="checkmark"></span>
                                                            <p>{item.fullname}</p>
                                                        </div>
                                                        <div className={styles.btns}>
                                                            <button className={styles.remove} onClick={() => handleRemove(item._id)}>Remove</button>
                                                            <button className={styles.edit} onClick={() => handleEdit(item)}>Edit</button>
                                                        </div>
                                                    </div>
                                                    <p className={styles.address}>{item.address},{item.country}</p>
                                                    <p className={`${styles.address} ${styles.phone}`}>
                                                        Phone no: <span>{item.phone}</span>
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                                <div className={styles.billigAddress}>
                                    <h4 className={styles.title}>Shiping Address</h4>
                                    <div className={styles.addBox}>
                                        <div className={styles.flexContainer}>
                                            {addressList.filter((addr) => addr.address_type === "Shipping").map((item) => (
                                                <label className="radio-button-container" key={item.id}>
                                                    <div className={styles.box}>
                                                        <div className={styles.name}>
                                                            <div className={styles.radio}>
                                                                <input
                                                                    type="radio"
                                                                    name="shipping"
                                                                    checked={selectedShippingId === item._id}
                                                                    onChange={() => {
                                                                        setSelectedShippingId(item._id);
                                                                        handleAddressCountryChange(item.country, "selection");
                                                                    }}
                                                                />
                                                                <span className="checkmark"></span>
                                                                <p>{item.fullname}</p>
                                                            </div>
                                                            <div className={styles.btns}>
                                                                <button className={styles.remove} onClick={() => handleRemove(item._id)}>Remove</button>
                                                                <button className={styles.edit} onClick={() => handleEdit(item)}>Edit</button>
                                                            </div>
                                                        </div>
                                                        <p className={styles.address}>{item.address},{item.country}</p>
                                                        <p className={`${styles.address} ${styles.phone}`}>
                                                            Phone no: <span>{item.phone}</span>
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div></>}
                            {/* address listing */}

                            {/* address form */}
                            {showForm && <div className={styles.addAddressForm}>
                                <div className={styles.head}>
                                    <h2 className={styles.heading}>Add Delivery Address</h2>
                                </div>

                                <form className={styles.formBox} onSubmit={formik.handleSubmit}>
                                    {/* <AddressForm /> */}
                                    <div className={styles.detail}>
                                        <div className={styles.formControl} >
                                            <label htmlFor="name">Full name<span>*</span></label>
                                            <input required placeholder='Enter your Full name' type="text" id="billingAddress.fullname" name="billingAddress.fullname" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.billingAddress.fullname} />
                                            {formik.touched.billingAddress && formik.touched?.billingAddress?.fullname && formik.errors?.billingAddress?.fullname ? (
                                                <div className={styles.error}>{formik.errors.billingAddress.fullname}</div>
                                            ) : null}
                                        </div>
                                        <div className={styles.wrapper}>
                                            <div className={styles.formControl}>
                                                <label htmlFor="email">Email Address<span>*</span></label>
                                                <input required placeholder='Enter your Email address' type="email" id="billingAddress.email" name="billingAddress.email" onBlur={formik.handleBlur} onChange={(e) => { formik.handleChange(e); setEmail(e.target.value) }} value={formik.values.billingAddress.email} />
                                                {formik.touched.billingAddress && formik.touched?.billingAddress?.email && formik.errors?.billingAddress?.email ? (
                                                    <div className={styles.error}>{formik.errors.billingAddress.email}</div>
                                                ) : null}
                                            </div>
                                            <div className={styles.formControl}>
                                                <label htmlFor="phone">Phone no<span>*</span></label>
                                                <input required placeholder='Enter your phone no' type="billingAddress.phone" id="billingAddress.phone" name="billingAddress.phone" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.billingAddress.phone} />
                                                {formik.touched.billingAddress && formik.touched?.billingAddress?.phone && formik.errors?.billingAddress?.phone ? (
                                                    <div className={styles.error}>{formik.errors.billingAddress.phone}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className={styles.formControl}>
                                            <label htmlFor="address">Address<span>*</span></label>
                                            <input required placeholder='Enter house no, building, street, area' type="text" id="billingAddress.address" name="billingAddress.address" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.billingAddress.address} />
                                            {formik.touched.billingAddress && formik.touched?.billingAddress?.address && formik.errors?.billingAddress?.address ? (
                                                <div className={styles.error}>{formik.errors.billingAddress.address}</div>
                                            ) : null}
                                        </div>
                                        <div className={`${styles.rowSection} ${styles.wrapper}`}>
                                            <div className={styles.formControl}>
                                                <label htmlFor="locality">Locality<span>*</span></label>
                                                <input required placeholder='Enter house no, building' type="text" id="billingAddress.locality" name="billingAddress.locality" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.billingAddress.locality} />
                                                {formik.touched.billingAddress && formik.touched?.billingAddress?.locality && formik.errors?.billingAddress?.locality ? (
                                                    <div className={styles.error}>{formik.errors.billingAddress.locality}</div>
                                                ) : null}
                                            </div>
                                            <div className={styles.formControl}>
                                                <label htmlFor="pincode">Pincode<span>*</span></label>
                                                <input required placeholder='Enter pin code' type="number" id="billingAddress.pincode" name="billingAddress.pincode" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.billingAddress.pincode} />
                                                {formik.touched.billingAddress && formik.touched?.billingAddress?.pincode && formik.errors?.billingAddress?.pincode ? (
                                                    <div className={styles.error}>{formik.errors.billingAddress.pincode}</div>
                                                ) : null}
                                            </div>
                                            <div className={styles.formControl}>
                                                <label htmlFor="country">Country<span>*</span></label>
                                                <select required id="billingAddress.country" name="billingAddress.country" onBlur={(e) => { formik.handleBlur(e); handleAddressCountryChange(e, "billing") }} onChange={(e) => { formik.handleChange(e); handleAddressCountryChange(e, "billing") }} value={formik.values.billingAddress.country}>
                                                    <option value="0">Select Country</option>
                                                    {Country.getAllCountries().map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                </select>
                                                {formik.touched.billingAddress && formik.touched?.billingAddress?.country && formik.errors?.billingAddress?.country ? (
                                                    <div className={styles.error}>{formik.errors.billingAddress.country}</div>
                                                ) : null}
                                            </div>
                                            {showForm === "add" && <div className={styles.formControl}>
                                                <label htmlFor="address_type">Address Type <span>*</span></label>
                                                <select required id="billingAddress.address_type" name="billingAddress.address_type" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.billingAddress.address_type}>
                                                    <option value="">Select Address Type</option>
                                                    <option value="Shipping">Shipping Address</option>
                                                    <option value="Billing">Billing Address</option>
                                                </select>
                                                {formik.touched.billingAddress && formik.touched?.billingAddress?.address_type && formik.errors?.billingAddress?.address_type ? (
                                                    <div className={styles.error}>{formik.errors.billingAddress.address_type}</div>
                                                ) : null}
                                            </div>}
                                        </div>
                                        <div className={styles.formControl}>
                                            <label htmlFor="country">Order notes (optional) </label>
                                            <textarea placeholder='Message' id="billingAddress.order_note" name="billingAddress.order_note" rows="3" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.billingAddress.order_note}></textarea>
                                        </div>
                                    </div>
                                    {showForm === "add" && <div className={styles.checkContainer}>
                                        <input type="checkbox" className='customCheckbox'
                                            id="sameAsBilling"
                                            name="sameAsBilling"
                                            checked={formik.values.sameAsBilling}
                                            onChange={(e) => { formik.setFieldValue("sameAsBilling", e.target.checked); handleAddressCountryChange(e, "sameAsBilling") }} />
                                        <label className="radio-button-container" htmlFor='sameAsBilling'>Ship to same address</label>
                                    </div>}
                                    {!formik.values.sameAsBilling && <div className={styles.detail}>
                                        <div className={styles.formControl} >
                                            <label htmlFor="name">Full name<span>*</span></label>
                                            <input required placeholder='Enter your Full name' type="text" id="shippingAddress.fullname" name="shippingAddress.fullname" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.shippingAddress.fullname} />
                                            {formik.touched.shippingAddress && formik.touched?.shippingAddress?.fullname && formik.errors?.shippingAddress?.fullname ? (
                                                <div className={styles.error}>{formik.errors.shippingAddress.fullname}</div>
                                            ) : null}
                                        </div>
                                        <div className={styles.wrapper}>
                                            <div className={styles.formControl}>
                                                <label htmlFor="email">Email Address<span>*</span></label>
                                                <input required placeholder='Enter your Full name' type="email" id="shippingAddress.email" name="shippingAddress.email" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.shippingAddress.email} />
                                                {formik.touched.shippingAddress && formik.touched?.shippingAddress?.email && formik.errors?.shippingAddress?.email ? (
                                                    <div className={styles.error}>{formik.errors.shippingAddress.email}</div>
                                                ) : null}
                                            </div>
                                            <div className={styles.formControl}>
                                                <label htmlFor="phone">Phone no<span>*</span></label>
                                                <input required placeholder='Enter your phone no' type="shippingAddress.phone" id="shippingAddress.phone" name="shippingAddress.phone" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.shippingAddress.phone} />
                                                {formik.touched.shippingAddress && formik.touched?.shippingAddress?.phone && formik.errors?.shippingAddress?.phone ? (
                                                    <div className={styles.error}>{formik.errors.shippingAddress.phone}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className={styles.formControl}>
                                            <label htmlFor="address">Address<span>*</span></label>
                                            <input required placeholder='Enter house no, building, street, area' type="text" id="shippingAddress.address" name="shippingAddress.address" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.shippingAddress.address} />
                                            {formik.touched.shippingAddress && formik.touched?.shippingAddress?.address && formik.errors?.shippingAddress?.address ? (
                                                <div className={styles.error}>{formik.errors.shippingAddress.address}</div>
                                            ) : null}
                                        </div>
                                        <div className={`${styles.rowSection} ${styles.wrapper}`}>
                                            <div className={styles.formControl}>
                                                <label htmlFor="locality">Locality<span>*</span></label>
                                                <input required placeholder='Enter house no, building' type="text" id="shippingAddress.locality" name="shippingAddress.locality" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.shippingAddress.locality} />
                                                {formik.touched.shippingAddress && formik.touched?.shippingAddress?.locality && formik.errors?.shippingAddress?.locality ? (
                                                    <div className={styles.error}>{formik.errors.shippingAddress.locality}</div>
                                                ) : null}
                                            </div>
                                            <div className={styles.formControl}>
                                                <label htmlFor="pincode">Pincode<span>*</span></label>
                                                <input required placeholder='Enter pin code' type="number" id="shippingAddress.pincode" name="shippingAddress.pincode" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.shippingAddress.pincode} />
                                                {formik.touched.shippingAddress && formik.touched?.shippingAddress?.pincode && formik.errors?.shippingAddress?.pincode ? (
                                                    <div className={styles.error}>{formik.errors.shippingAddress.pincode}</div>
                                                ) : null}
                                            </div>
                                            <div className={styles.formControl}>
                                                <label htmlFor="country">Country<span>*</span></label>
                                                <select required id="shippingAddress.country" name="shippingAddress.country" onBlur={(e) => { formik.handleBlur(e); handleAddressCountryChange(e, "shipping"); }} onChange={(e) => { formik.handleChange(e); handleAddressCountryChange(e, "shipping"); }} value={formik.values.shippingAddress.country}>
                                                    <option value="0">Select Country</option>
                                                    {Country.getAllCountries().map((c) => <option value={c.name}>{c.name}</option>)}
                                                </select>
                                                {formik.touched.shippingAddress && formik.touched?.shippingAddress?.country && formik.errors?.shippingAddress?.country ? (
                                                    <div className={styles.error}>{formik.errors.shippingAddress.country}</div>
                                                ) : null}
                                            </div>
                                            {showForm === "add" && <div className={styles.formControl}>
                                                <label htmlFor="address_type">Address Type <span>*</span></label>
                                                <select required id="shippingAddress.address_type" name="shippingAddress.address_type" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.shippingAddress.address_type}>
                                                    <option value="">Select Address Type</option>
                                                    <option value="Shipping">Shipping Address</option>
                                                    <option value="Billing">Billing Address</option>
                                                </select>
                                                {formik.touched.shippingAddress && formik.touched?.shippingAddress?.address_type && formik.errors?.shippingAddress?.address_type ? (
                                                    <div className={styles.error}>{formik.errors.shippingAddress.address_type}</div>
                                                ) : null}
                                            </div>}
                                        </div>
                                        <div className={styles.formControl}>
                                            <label htmlFor="country">Order notes (optional) </label>
                                            <textarea placeholder='Message' id="shippingAddress.order_note" name="shippingAddress.order_note" rows="3" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.shippingAddress.order_note}></textarea>
                                        </div>
                                    </div>}
                                    <div className={styles.saveBtn}>
                                        {session?.user?.id && addressList.length != 0 && <><Button className={`${styles.btn}`} type='button' onClick={() => setShowForm(false)}>Cancel</Button>&nbsp;</>}
                                        {session?.user?.id && <Button className={`${styles.btn} ${styles.update}`} type='submit'>Save Address</Button>}
                                    </div>
                                </form>
                            </div>}
                            {/* address form */}
                            <div className={styles.paymentMethod}>
                                <h2 className={styles.heading}>Order Notes</h2>
                                <p>Mention your order notes (Optional).</p>
                                <form className={styles.formWrapper}>
                                    <div className={styles.formControl}>
                                        <textarea placeholder='Order Notes (Optional)' rows="3" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)}></textarea>
                                    </div>
                                </form>
                                <p></p>
                            </div>
                            {/* payment */}
                            <div className={styles.paymentMethod}>
                                <h2 className={styles.heading}>Payment</h2>
                                <p>All transactions are secure and encrypted.</p>
                                <p>?? Get Extra 5% OFF! Choose <strong>Credit Card</strong> at checkout and save more on your order!</p>
                                <form className={styles.formWrapper}>
                                    {/*  credit card */}

                                    <div className={styles.otherOptions}>
                                        <div className={styles.payBox}>
                                            <div className={`${styles.name} ${styles.upiContainer}`}>
                                                <div className={styles.radio}>
                                                    <label className="radio-button-container">
                                                        <input type="radio" name="payment" value="creditcard" onChange={(e) => handlePaymentChange(e, 5)} />
                                                        <span className={`checkmark ${styles.checkmark}`}></span>
                                                        <p>Credit Card</p>
                                                    </label>
                                                </div>
                                            </div>
                                            {session?.user?.id && <label className="radio-button-container">
                                                <input type="radio" name="payment" value="contractual" onChange={(e) => handlePaymentChange(e, 0)} />
                                                <span className={`checkmark ${styles.checkmark}`}></span>
                                                <p className={styles.bank}>Contractual Basis</p>
                                            </label>}
                                        </div>
                                    </div>
                                    {/* other */}
                                </form>
                            </div>
                            {/* payment */}
                        </div>

                        <div className={styles.checkoutOrders}>
                            {/* coupon */}
                            <div className={styles.coupon}>
                                <h2 className={styles.heading}>Got a coupon</h2>
                                <div className={styles.flexContainer}>
                                    <div className={styles.entercode}>
                                        <label htmlFor="coupon">{couponCode ? 'Coupon Applied' : 'Apply coupon'}</label>
                                        <input type="text" id="coupon" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                    </div>
                                    <div className={styles.morecoupons}>
                                        <Button variant="primary" className={styles.btn} onClick={applyCoupon}>Apply Now  </Button>
                                    </div>
                                </div>
                            </div>
                            {/* coupon */}

                            {/* Reward Redeem */}
                            {reward.is_elegible && <div className={styles.coupon}>
                                <h2 className={styles.heading}>Redeem Rewards</h2>
                                <label className='mb-2'>You have <span style={{ color: "#F26B45", fontWeight: "bold" }}> {disableRedeem ? "0" : reward.claimRewards || 0} reward </span> points available for redemption.</label>
                                <div className={`${styles.flexContainer} justify-content-end`}>
                                    <div className={styles.morecoupons}>
                                        <Button disabled={disableRedeem} variant="primary" className={`${styles.btn} flex-shrink-0`} onClick={() => {
                                            redeemReward()
                                        }}>{disableRedeem ? 'Redeemed' : 'Redeem Now'} </Button>
                                    </div>
                                </div>
                            </div>}
                            {/* Reward Redeem */}

                            {/* order summary */}
                            <div className={styles.order}>
                                <h2 className={styles.heading}>Your Order</h2>
                                {cart?.products && cart.products.map((product, index) => <div className={styles.productDetail}>
                                    <div className={styles.productImg}>
                                        <Image src={product.img || product.product_id ? "/images/cart-page-product.png" : "/images/glazing-tap.jpg"} alt="product" width={120} height={120} />
                                    </div>
                                    <div className={styles.productInfo}>
                                        <p className={styles.productName}>{product.product_name || product.name}</p>
                                        <p className={styles.deliveryTxt}>Estimated delivery by<br />
                                            <span> {moment().add(10, "days").format("Do MMMM YYYY")} </span></p>
                                    </div>
                                    <div className={styles.deleteIcon} style={{ cursor: 'pointer' }} onClick={() => { deleteProduct(index) }} >
                                        <Image src="/images/bin-icon.svg" alt="delete" width={20} height={20} />
                                    </div>
                                </div>)}
                                <div className={styles.ordersummary}>
                                    {/* <div className={styles.flex}>
                                        <p>Quantity:</p>
                                        <p className={styles.bold}></p>
                                    </div> */}
                                    <div className={styles.flex}>
                                        <p>Sub Total:</p>
                                        <p className={styles.bold}><span>AED</span>{totalData.subTotal.toFixed(2)}</p>
                                    </div>
                                    {/* <div className={styles.flex}>
                                        <p>TAX:</p>
                                        <p className={styles.bold}><span>AED</span>{totalData.tax.toFixed(2)}</p>
                                    </div> */}
                                    <div className={styles.flex}>
                                        <p>Discount:</p>
                                        <p className={styles.bold}><span>AED</span>{totalData.discount.toFixed(2)}</p>
                                    </div>
                                    {totalData.reward > 0 && <div className={styles.flex}>
                                        <p>Rewards:</p>
                                        <p className={styles.bold}><span>AED</span>{parseInt(totalData.reward)}</p>
                                    </div>}
                                    {totalData.advancedPaymentDiscount > 0 && <div className={styles.flex}>
                                        <p>Advanced Payment Discount:</p>
                                        <p className={styles.bold}><span>AED</span>{parseFloat(totalData.advancedPaymentDiscount)}</p>
                                    </div>}
                                </div>
                                <div className={styles.grandTotal}>
                                    <p className={styles.total}>Shipping: </p>
                                    <p className={styles.price}><span>AED</span>{totalData.shipping ? totalData.shipping.toFixed(2) : 0}</p>
                                </div>
                                <div className={styles.grandTotal}>
                                    <p className={styles.total}>Total: </p>
                                    <p className={styles.price}><span>AED</span>{(parseFloat(totalData.grandTotal || 0) + parseFloat(totalData.shipping || 0)).toFixed(2)}</p>
                                </div>
                                <div className={styles.grandTotal}>
                                    <p className={styles.total}>VAT (5%): </p>
                                    <p className={styles.price}><span>AED</span>{totalData.vat}</p>
                                </div>
                                <div className={styles.grandTotal}>
                                    <p className={styles.total}>Grand Total: </p>
                                    <p className={styles.price}><span>AED</span>{(parseFloat(totalData.grandTotal || 0) + parseFloat(totalData.shipping || 0) + parseFloat(totalData.vat || 0)).toFixed(2)}</p>
                                </div>
                                <div className={styles.agreement}>
                                    <input type="checkbox" onChange={(e) => {
                                        setAcceptPolicy(e.target.checked)
                                    }} id="agreement" className='customCheckbox' checked={acceptPolicy} />
                                    <label htmlFor="agreement">I have read and agree to the website<a target='_blank' style={{ color: '#F26B45', fontWeight: '500' }} href='/terms-condition'> terms and conditions.</a></label>
                                </div>
                                <div className={styles.processbuttons}>
                                    <Button className={styles.btn} onClick={() => proceedToCheckout(true)}>Proceed To Checkout</Button>
                                </div>
                            </div>
                            {/* order summary */}

                        </div>
                    </div> : !loading && <div className={styles.emptyCart}>
                        <div className={styles.emptyCartImage}>
                            <Image
                                src={"/images/empty-cart.svg"}
                                alt="empty cart"
                                width={200}
                                height={200}
                            />
                            <p className={styles.carttext}>No Items to checkout</p>
                            <Link className={"btn btn-primary"} href="/shop">
                                Go to Shop
                            </Link>
                        </div>
                    </div>}


                </div>
            </main>
            <Footer />
            <Modal dialogClassName={styles.Modal} centered show={emailModal} onHide={() => setEmailModal(false)}>
                <Modal.Header closeButton ><Modal.Title>Verify Your Email Address</Modal.Title></Modal.Header>
                <p className={styles.message}>
                    It seems you've used this email for a previous order.<br />Would you like us to send an OTP to confirm it for checkout?
                </p>
                <Modal.Body className={styles.modalBody}>
                    <div className={styles.footerButtons}>
                        <Button variant='border' type="button" onClick={sendOtp}>Yes</Button>
                        <Button type="button" onClick={() => setEmailModal(false)}>No</Button>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal dialogClassName={styles.Modal} centered show={otpModal} onHide={() => setOtpModal(false)}>
                <Modal.Header closeButton><Modal.Title>Verify OTP</Modal.Title></Modal.Header>
                <p className={styles.message}>
                    OTP has been sent to {formik.values.email} email address.<br />Please enter the OTP to confirm your order.
                </p>
                <Modal.Body className={styles.modalBody}>
                    <form className={styles.login} onSubmit={handleSubmit}>
                        <div className={`${styles.otpInputs}`} ref={otpContainerRef}>
                            {[...Array(4)].map((_, index) => (
                                <input
                                    key={index}
                                    type="number"
                                    max={9}
                                    maxLength={1}
                                    required
                                    onChange={(e) => handleInputChange(index, e)}
                                />
                            ))}
                        </div>

                        <Button className={styles.submit} type="submit">Verify Otp</Button>
                        <p className={styles.resend}>didn't receive code? <button disabled={timer > 0} onClick={sendOtp}>Resend</button></p>
                        <p className={styles.timer}>Code is valid for <span>{seconds(timer)}</span> minutes</p>
                    </form>
                </Modal.Body>
            </Modal>

        </>
    )
}
