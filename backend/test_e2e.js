const axios = require("axios");

// Start server in-process
require("./server.js");

const BASE_URL = "http://localhost:3000/api";

async function runE2ETest() {
    console.log("Waiting 2.5s for MongoDB connection to initialize...");
    await new Promise((resolve) => setTimeout(resolve, 2500));

    console.log("🚀 Starting End-to-End Surveillance API Test Suite...");
    const timestamp = Date.now();
    const testUser = {
        name: "Security Lead Tester",
        username: `sec_lead_${timestamp}`,
        email: `lead_${timestamp}@vigilai.test`,
        password: "TestPassword123!"
    };

    try {
        // 1. User Signup
        console.log("1. Testing User Registration (/api/auth/signup)...");
        const signupRes = await axios.post(`${BASE_URL}/auth/signup`, testUser);
        console.log("   ✅ User Registered. User ID:", signupRes.data.user._id);
        let token = signupRes.data.token;

        // 2. Organization Creation
        console.log("2. Testing Organization Creation & Auto-Provisioning (/api/org/create)...");
        const orgRes = await axios.post(
            `${BASE_URL}/org/create`,
            { orgName: `Apex Facility Sector ${timestamp}`, orgType: "Enterprise" },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("   ✅ Organization Created:", orgRes.data.organization.organization_name);
        console.log("   ✅ Generated Join Code:", orgRes.data.joinCode);
        token = orgRes.data.token; // Use fresh token with org_id and owner role

        // 3. Verify Camera Provisioning
        console.log("3. Verifying Auto-Provisioned Surveillance Cameras (/api/camera)...");
        const camRes = await axios.get(`${BASE_URL}/camera`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Pre-provisioned Cameras Count: ${camRes.data.cameras.length}`);
        if (camRes.data.cameras.length < 4) {
            throw new Error("Expected at least 4 default cameras to be provisioned.");
        }

        // 4. Test Camera Registration
        console.log("4. Testing New Camera Registration (/api/camera POST)...");
        const newCam = await axios.post(
            `${BASE_URL}/camera`,
            {
                name: "Camera 05 - Loading Bay B",
                location: "Warehouse North",
                camera_type: "outdoor",
                resolution: "4K",
                fps: 30,
                zone_name: "Zone Echo"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("   ✅ Registered Custom Camera:", newCam.data.camera.name);

        // 5. Test Dashboard Stats
        console.log("5. Testing Surveillance Dashboard Telemetry (/api/video/dashboard-stats)...");
        const dashRes = await axios.get(`${BASE_URL}/video/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("   ✅ Dashboard Stats:", {
            totalCameras: dashRes.data.totalCameras,
            activeCameras: dashRes.data.activeCameras,
            incidents: dashRes.data.totalIncidents
        });

        // 6. Test Event Retrieval
        console.log("6. Testing Event & Alert Queries (/api/event)...");
        const eventRes = await axios.get(`${BASE_URL}/event?page=1&limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("   ✅ Events API response code:", eventRes.status, "Total alerts:", eventRes.data.total);

        // 7. Test User Profile Retrieval
        console.log("7. Testing User Profile (/api/user/profile)...");
        const profileRes = await axios.get(`${BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("   ✅ Profile Loaded:", profileRes.data.name, "| Role:", profileRes.data.role);

        console.log("\n=======================================================");
        console.log("🎉 ALL 7 END-TO-END VERIFICATION CHECKS PASSED WITH 100% SUCCESS!");
        console.log("=======================================================");
        process.exit(0);

    } catch (error) {
        console.error("❌ E2E Test Failed:", error.response?.data || error.message);
        process.exit(1);
    }
}

runE2ETest();
