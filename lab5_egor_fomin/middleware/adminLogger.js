module.exports = (req, action, objectType, objectId) => {
    const timestamp = new Date().toISOString();
    console.log(`ADMIN ACTION | ${req.session.user.email} | ${action} ${objectType} | ${objectType} ID: ${objectId} | ${timestamp}`);
};
