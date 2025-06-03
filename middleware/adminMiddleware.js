import User from "../models/user.js";
import jwt from "jsonwebtoken"

const adminMiddleware = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'Access denied User Not Found' });

    if (user.role !== 'admin') return res.status(403).json({ message: 'Access denied: Admins only' });
    next();
};

export default adminMiddleware;
