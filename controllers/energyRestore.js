const cron = require('node-cron');
const connection = require("../config/database");
const User = connection.models.User;

function startEnergyRestoreScheduler() {
    // runs every minute
    cron.schedule('* * * * *', async () => {
        const users = await User.find({});
        const now = new Date();
        const cooldown = 4 * 60 * 60 * 1000; // 12 h

        for (const user of users) {
            if (!user.lastEnergyRestore) {
                user.lastEnergyRestore = now;
                await user.save();
            } else {
                const elapsed = now - user.lastEnergyRestore;
                if (elapsed >= cooldown) {
                    const restores = Math.floor(elapsed / cooldown);
                    const maxEnergy = 5;
                    user.packEnergy = Math.min(user.packEnergy + restores, maxEnergy);
                    user.lastEnergyRestore = new Date(user.lastEnergyRestore.getTime() + restores * cooldown);
                    await user.save();
                }
            }
        }
        console.log("(DBG) New energy restore: ", now);
    });
}

module.exports = startEnergyRestoreScheduler;