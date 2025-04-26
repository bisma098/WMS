const express = require("express");
const cors = require("cors");
const sql = require('mssql');
const app = express();
const bcrypt = require("bcrypt") //bcrypt backage for hashing passwords

app.use(cors());
const port = 5000;
const config = {
    user: 'sa', // Replace with your SQL Server username
    password: 'bix098', // Replace with your SQL Server password
    server: 'localhost', // Replace with your server name
    database: 'WMS', // Replace with your database name
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true // Use this to trust the self-signed certificate
    }
};



sql.connect(config, (err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to SQL Server');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
app.use(express.json());
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        const request = new sql.Request();

        request.input("username", sql.VarChar, username);
        request.input("password", sql.VarChar, password);

        const loginQuery = `
        SELECT UserID, UserName FROM Users 
        WHERE UserName = @username AND Password = HASHBYTES('SHA2_256', @password)
    `;
        const result = await request.query(loginQuery);

        if (result.recordset.length > 0) {
            res.json({ success: true, message: "Login successful", user: result.recordset[0] });
        } else {
            res.status(401).json({ success: false, message: "Invalid username or password" })
        }

    } catch (err) {
        res.status(500).json({ success: false, message: "Error logging in" + err.message });
    }
});

// SIGNUP API
app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const request = new sql.Request();

        // Check if username already exists
        const checkUserQuery = `SELECT UserID FROM Users WHERE username = @username`;
        request.input("username", sql.VarChar, username);
        const existingUser = await request.query(checkUserQuery);

        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const insertQuery = `
        INSERT INTO Users (UserName, Password) 
        VALUES (@username, HASHBYTES('SHA2_256', @password))
    `;
        request.input("password", sql.VarChar, password);

        await request.query(insertQuery);

        res.status(201).json({ success: true, message: "User registered successfully" });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error during signup" + err.message });
    }
});

app.post("/user-details", async (req, res) => {
    try {
        const { username, firstName, lastName, phoneNo, alternatePhone, email, address } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        // 1. Create a request to update user info
        const updateRequest = new sql.Request();
        updateRequest.input("username", sql.VarChar, username);
        updateRequest.input("firstName", sql.VarChar, firstName);
        updateRequest.input("lastName", sql.VarChar, lastName);
        updateRequest.input("phoneNo", sql.VarChar, phoneNo);
        updateRequest.input("alternatePhone", sql.VarChar, alternatePhone);
        updateRequest.input("email", sql.VarChar, email);
        updateRequest.input("address", sql.VarChar, address);

        const updateQuery = `
            UPDATE Users 
            SET First_Name = @firstName, Last_Name = @lastName, Phone_No = @phoneNo, 
                Alternate_Phone_no = @alternatePhone, Email = @email, Address = @address 
            WHERE UserName = @username
        `;

        await updateRequest.query(updateQuery);

        const fetchRequest = new sql.Request();
        fetchRequest.input("username", sql.VarChar, username);
        const result = await fetchRequest.query(`SELECT UserID, UserName FROM Users WHERE UserName = @username`);

        res.status(200).json({
            success: true,
            message: "User details updated successfully",
            user: result.recordset[0]
        });

    } catch (err) {
        console.error("User details error:", err);
        res.status(500).json({ message: "Error updating user details" });
    }
});
// View user details by username
app.get("/view-user-details/:username", async (req, res) => {
    try {
        const username = req.params.username;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Username is required"
            });
        }

        const request = new sql.Request();
        request.input("username", sql.VarChar, username);

        const query = `
            SELECT UserID, UserName, First_Name, Last_Name, Phone_No, Alternate_Phone_no, Email, Address
            FROM Users
            WHERE UserName = @username;
        `;
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: result.recordset[0],
            message: "User details retrieved successfully"
        });

    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching user details"
        });
    }
});
//view all weddings
// Get all weddings for a specific UserID
app.get("/weddings/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const request = new sql.Request();
        request.input("userID", sql.Int, userId);

        const query = `
            SELECT Wedding_ID, Groom_Name + ' weds ' + Bride_Name AS Wedding_Title
            FROM Wedding_Table
            WHERE UserID = @userID
        `;

        const result = await request.query(query);

        res.status(200).json({
            success: true,
            weddings: result.recordset
        });

    } catch (err) {
        console.error("Error fetching weddings:", err);
        res.status(500).json({
            success: false,
            message: "Server error while fetching weddings"
        });
    }
});


//book a new wedding
app.post("/book-wedding", async (req, res) => {
    try {
        const { userId, groomName, brideName } = req.body;

        if (!userId || !groomName || !brideName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const request = new sql.Request();
        request.input("userId", sql.Int, userId);
        request.input("groomName", sql.VarChar, groomName);
        request.input("brideName", sql.VarChar, brideName);

        const insertQuery = `
            INSERT INTO Wedding_Table (UserID, Groom_Name, Bride_Name)
            VALUES (@userId, @groomName, @brideName);
            SELECT SCOPE_IDENTITY() AS Wedding_ID;
        `;

        const result = await request.query(insertQuery);
        const weddingId = result.recordset[0].Wedding_ID;

        res.status(201).json({ success: true, message: "Wedding booked successfully", weddingId });

    } catch (err) {
        console.error("Error booking wedding:", err);
        res.status(500).json({ message: "Error booking wedding" });
    }
});
// GET Wedding Title by Wedding_ID
app.get("/wedding-title/:weddingId", async (req, res) => {
    try {
        const { weddingId } = req.params;
        const request = new sql.Request();
        request.input("weddingId", sql.Int, weddingId);

        const result = await request.query(`
            SELECT Groom_Name, Bride_Name 
            FROM Wedding_Table 
            WHERE Wedding_ID = @weddingId
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Wedding not found" });
        }

        const { Groom_Name, Bride_Name } = result.recordset[0];
        res.status(200).json({ title: `${Groom_Name} weds ${Bride_Name}` });

    } catch (err) {
        res.status(500).json({ message: "Server error: " + err.message });
    }
});
//get all events of a wedding
app.get("/events/:weddingId", async (req, res) => {
    try {
        const weddingId = req.params.weddingId;

        if (!weddingId) {
            return res.status(400).json({ success: false, message: "Wedding ID is required" });
        }

        const request = new sql.Request();
        request.input("weddingId", sql.Int, weddingId);

        await request.query(`
            Update Event_Details
            set Status='Completed'
            where [Date and Time]<GETDATE();
            `
        );
        const query = `
            SELECT e.Event_ID, e.[Type], e.[Date and Time], e.[Status], e.Rating
            FROM Event_Details e
            WHERE e.Wedding_ID = @weddingId
            ORDER BY e.[Date and Time];
        `;

        const result = await request.query(query);
        res.status(200).json({ success: true, events: result.recordset });

    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ success: false, message: "Error fetching events" });
    }
});

//get upcoming events of a wedding
app.get("/upcoming-events/:weddingId", async (req, res) => {
    try {
        const weddingId = req.params.weddingId;

        if (!weddingId) {
            return res.status(400).json({ success: false, message: "Wedding ID is required" });
        }

        const request = new sql.Request();
        request.input("weddingId", sql.Int, weddingId);

        const query = `
            SELECT e.Event_ID, e.[Type], e.[Date and Time]
            FROM Event_Details e
            WHERE e.Wedding_ID = @weddingId and Status='Upcoming' and e.[Date and Time]>GETDATE()
            order by e.[Date and Time];
        `;

        const result = await request.query(query);
        res.status(200).json({ success: true, events: result.recordset });

    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ success: false, message: "Error fetching events" });
    }
});

app.post("/book-event", async (req, res) => {
    try {
        const { weddingID, dateTime, city, noOfGuests, type } = req.body;

        if (!weddingID || !dateTime || !city || !noOfGuests || !type) {
            return res.status(400).json({ message: "All event details are required" });
        }

        // Check if the event date is at least 2 weeks from today and not in the past
        const eventDate = new Date(dateTime);
        const today = new Date();
        const twoWeeksFromNow = new Date(today.setDate(today.getDate() + 7));

        if (eventDate < twoWeeksFromNow) {
            return res.status(400).json({ message: "Event must be booked at least 1 weeks from today" });
        }

        if (eventDate < new Date()) {
            return res.status(400).json({ message: "Event date cannot be in the past" });
        }

        const request = new sql.Request();
        request.input("weddingID", sql.Int, weddingID);
        request.input("type", sql.VarChar, type);
        request.input("city", sql.VarChar, city);

        // Check if an event of the same type already exists for the given Wedding_ID
        const checkQuery = `
            SELECT COUNT(*) AS EventCount 
            FROM Event_Details 
            WHERE Wedding_ID = @weddingID AND [Type] = @type
        `;

        const checkResult = await request.query(checkQuery);
        if (checkResult.recordset[0].EventCount > 0) {
            return res.status(400).json({ message: `An event of type '${type}' already exists for this wedding.` });
        }

        // Check if the city exists in the Locations table
        const checkCityQuery = `SELECT Location_ID FROM Locations WHERE City = @city`;
        const cityResult = await request.query(checkCityQuery);

        if (cityResult.recordset.length === 0) {
            return res.status(400).json({ message: "Sorry, we are not available in this city." });
        }

        // Insert event with the retrieved Location_ID
        request.input("dateTime", sql.DateTime, dateTime);
        request.input("noOfGuests", sql.Int, noOfGuests);

        const insertQuery = `
            INSERT INTO Event_Details (Wedding_ID, [Date and Time], City, No_Of_Guests, [Status], [Type])
            VALUES (@weddingID, @dateTime, @City, @noOfGuests, 'Upcoming', @type);
            SELECT SCOPE_IDENTITY() AS EventID;
        `;

        const result = await request.query(insertQuery);
        const eventID = result.recordset[0].EventID;

        // Add the newly generated event ID as input
        request.input("eventID", sql.Int, eventID);

        await request.query(`
            INSERT INTO Vendor_Bookings(Event_id)
            VALUES (@eventID)
        `);

        res.status(201).json({ success: true, message: "Event booked successfully", eventID });

    } catch (err) {
        console.error("Error booking event:", err);
        res.status(500).json({ message: "Server error during event booking" });
    }
});



// Get details of an  event
app.get("/events-details/:eventID", async (req, res) => {
    try {
        const eventId = req.params.eventID;

        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required" });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);

        await request.query(`
            Update Event_Details
            set Status='Completed'
            where [Date and Time]<GETDATE();
            `
        );

        const query = `
            SELECT w.Groom_Name, w.Bride_Name, e.[Type], e.[Date and Time], l.City + ', ' + l.Address AS Venue, e.No_Of_Guests, e.[Status],e.Rating
            FROM Event_Details e JOIN Wedding_Table w ON e.Wedding_ID = w.Wedding_ID 
            LEFT JOIN Locations l ON e.location_id = l.Location_ID WHERE e.Event_ID = @eventId ORDER BY e.[Date and Time]
        `;
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "No detail found for this event" });
        }

        res.status(200).json({ success: true, events: result.recordset });

    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ message: "Error fetching events" + err.message });
    }
});

// Get upcoming events for a user
app.get("/upcoming-events/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const request = new sql.Request();
        request.input("userId", sql.Int, userId);

        const query = `
            SELECT e.[Type], w.Groom_Name, w.Bride_Name, e.[Date and Time], l.City + ', ' + l.Address AS Venue, 
                   e.No_Of_Guests
            FROM Event_Details e 
            JOIN Wedding_Table w ON e.Wedding_ID = w.Wedding_ID 
            JOIN Locations l ON e.location_id = l.Location_ID
            WHERE w.UserID = @userId 
              AND Status='Upcoming' 
              AND e.[Date and Time] > GETDATE() 
            ORDER BY e.[Date and Time]
        `;

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "No upcoming events found for this user" });
        }

        res.status(200).json({ success: true, events: result.recordset });

    } catch (err) {
        console.error("Error fetching upcoming events:", err);
        res.status(500).json({ message: "Error fetching upcoming events" });
    }
});

// Cancel an event 
app.put("/cancel-event", async (req, res) => {
    try {
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Event ID is required"
            });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);

        const updateQuery = `
            UPDATE Event_Details
            SET Status = 'Cancelled'
            WHERE Event_ID = @eventId 
            AND Status = 'Upcoming'
        `;

        const result = await request.query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found or not in 'Upcoming' status"
            });
        }

        res.status(200).json({
            success: true,
            message: "Event cancelled successfully",
            eventId: eventId
        });

    } catch (err) {
        console.error("Error cancelling event:", {
            message: err.message,
            stack: err.stack,
            sqlError: err.originalError?.info?.message
        });
        res.status(500).json({
            success: false,
            message: "Error cancelling event: " + err.message
        });
    }
});

// Update Event Rating if Status is Completed and Rating is NULL or 0
app.post("/rate-event", async (req, res) => {
    try {
        const { eventId, rating } = req.body;

        if (!eventId || rating == null) {
            return res.status(400).json({ success: false, message: "Event ID and Rating are required" });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);
        request.input("rating", sql.Int, rating);

        const updateQuery = `
            UPDATE Event_Details
            SET Rating = @rating
            WHERE Event_ID = @eventId 
              AND Status = 'Completed' 
              AND (Rating IS NULL OR Rating = 0);
        `;

        const result = await request.query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(200).json({
                success: false,
                message: "Rating not updated. Event might not be completed or already rated."
            });
        }

        res.status(200).json({ success: true, message: "Rating updated successfully!" });
    } catch (err) {
        console.error("Error updating event rating:", err);
        res.status(500).json({ success: false, message: "Server error while updating rating" });
    }
});


// Get all vendors for an event
app.get("/event-vendors/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Event ID is required"
            });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);

        // Check if event exists
        const eventCheck = await request.query(`
            SELECT * FROM Event_Details WHERE Event_ID = @eventId
        `);

        if (eventCheck.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Fetch vendors separately
        const catering = await request.query(`
            SELECT Name, Contact_No, Email, Instagram, Cost, Rating 
            FROM Catering_Vendor 
            WHERE Vendor_ID = (SELECT Catering_Vendor_ID FROM Vendor_Bookings WHERE Event_id = @eventId)
        `);

        const decor = await request.query(`
            SELECT Name, Contact_No, Email, Instagram, Cost, Rating 
            FROM Decor_Vendor 
            WHERE Vendor_ID = (SELECT Decor_Vendor_ID FROM Vendor_Bookings WHERE Event_id = @eventId)
        `);

        const photography = await request.query(`
            SELECT Name, Contact_No, Email, Instagram, Cost, Rating 
            FROM Photography_Vendor 
            WHERE Vendor_ID = (SELECT Photography_Vendor_ID FROM Vendor_Bookings WHERE Event_id = @eventId)
        `);

        const hall = await request.query(`
            SELECT Name, 
                   (SELECT Address + ', ' + City FROM Locations WHERE Location_ID = h.Location_ID) AS Location, 
                   Contact_No, Capacity, Cost, Rating 
            FROM Hall_Vendor h 
            WHERE Vendor_ID = (SELECT Hall_Vendor_ID FROM Vendor_Bookings WHERE Event_id = @eventId)
        `);

        const dj = await request.query(`
            SELECT Name, Contact_No, Email, Instagram, Cost, Rating 
            FROM DJ_Vendors 
            WHERE Vendor_ID = (SELECT DJ_Vendor_ID FROM Vendor_Bookings WHERE Event_id = @eventId)
        `);

        // Format response
        const vendors = {
            catering: catering.recordset[0] || null,
            decor: decor.recordset[0] || null,
            photography: photography.recordset[0] || null,
            hall: hall.recordset[0] || null,
            dj: dj.recordset[0] || null
        };

        res.status(200).json({
            success: true,
            eventId: eventId,
            vendors: vendors
        });

    } catch (err) {
        console.error("Error fetching event vendors:", err);
        res.status(500).json({
            success: false,
            message: "Server error while fetching event vendors: " + err.message
        });
    }
});

app.get("/top-events", async (req, res) => {
    try {
        const request = new sql.Request();

        const query = `
            SELECT * from mostSuccessfulEvents;
        `;

        const result = await request.query(query);

        res.status(200).json({
            success: true,
            topEvents: result.recordset
        });

    } catch (err) {
        console.error("Error fetching top events:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching top events: " + err.message
        });
    }
});


//available hall vendors
app.get("/available-vendors/:eventId/hall", async (req, res) => {
    const eventId = req.params.eventId;
    const request = new sql.Request();

    try {
        if (!eventId) return res.status(400).json({ message: "Event ID required" });

        request.input("eventId", sql.Int, eventId);

        // Fetch Event Details
        const details = await request.query(`
            SELECT [Date and Time] AS eventDate, City AS eventCity, No_Of_Guests AS eventCapacity
            FROM Event_Details WHERE Event_ID = @eventId AND [Date and Time] > GETDATE()
        `);

        if (details.recordset.length === 0) {
            return res.status(404).json({ message: "Event not found or not upcoming" });
        }

        const { eventDate, eventCity, eventCapacity } = details.recordset[0];

        request.input("eventDate", sql.DateTime, eventDate);
        request.input("eventCity", sql.VarChar, eventCity);
        request.input("eventCapacity", sql.Int, eventCapacity);

        const halls = await request.query(`
            SELECT h.Vendor_ID, h.[Name] AS Vendor_Name, l.City + ', ' + l.Address AS Location,
                   h.Contact_No, h.Cost, h.Capacity, h.Rating 
            FROM Hall_Vendor h
            JOIN Locations l ON h.Location_ID = l.Location_ID
            WHERE NOT EXISTS (
                SELECT 1 FROM Vendor_Bookings vb
                JOIN Event_Details e ON vb.Event_id = e.Event_ID
                WHERE vb.Hall_Vendor_ID = h.Vendor_ID AND e.[Date and Time] = @eventDate
            ) AND l.City = @eventCity AND h.Capacity >= @eventCapacity
            ORDER BY h.Rating DESC, h.Cost DESC;
        `);

        res.status(200).json({ success: true, vendors: halls.recordset });

    } catch (err) {
        console.error("Error fetching hall vendors:", err);
        res.status(500).json({ message: "Server error while fetching hall vendors" });
    }
});

//available photography vendors
app.get("/available-vendors/:eventId/photography", async (req, res) => {
    const eventId = req.params.eventId;
    const request = new sql.Request();

    try {
        if (!eventId) return res.status(400).json({ message: "Event ID required" });

        request.input("eventId", sql.Int, eventId);

        // Fetch Event Details
        const details = await request.query(`
            SELECT [Date and Time] AS eventDate, City AS eventCity, No_Of_Guests AS eventCapacity
            FROM Event_Details WHERE Event_ID = @eventId AND [Date and Time] > GETDATE()
        `);

        if (details.recordset.length === 0) {
            return res.status(404).json({ message: "Event not found or not upcoming" });
        }

        const { eventDate, eventCity, eventCapacity } = details.recordset[0];

        request.input("eventDate", sql.DateTime, eventDate);
        request.input("eventCity", sql.VarChar, eventCity);
        request.input("eventCapacity", sql.Int, eventCapacity);

        const photographers = await request.query(`
             SELECT p.Vendor_ID, p.[Name] AS Vendor_Name, p.Contact_No,p.Email,p.Instagram, p.Cost, p.Rating 
                FROM Photography_Vendor p
                WHERE NOT EXISTS (
                    SELECT 1 FROM Vendor_Bookings vb 
                    JOIN Event_Details e ON vb.Event_id = e.Event_ID 
                    WHERE vb.Photography_Vendor_ID = p.Vendor_ID 
                    AND e.[Date and Time] = @eventDate
                ) 
                ORDER BY p.Rating DESC, p.Cost DESC;
        `);

        res.status(200).json({ success: true, vendors: photographers.recordset });

    } catch (err) {
        console.error("Error fetching photographers vendors:", err);
        res.status(500).json({ message: "Server error while fetching photographers vendors" });
    }
});

//available dj vendors
app.get("/available-vendors/:eventId/dj", async (req, res) => {
    const eventId = req.params.eventId;
    const request = new sql.Request();

    try {
        if (!eventId) return res.status(400).json({ message: "Event ID required" });

        request.input("eventId", sql.Int, eventId);

        // Fetch Event Details
        const details = await request.query(`
            SELECT [Date and Time] AS eventDate, City AS eventCity, No_Of_Guests AS eventCapacity
            FROM Event_Details 
            WHERE Event_ID = @eventId AND [Date and Time] > GETDATE()
        `);

        if (details.recordset.length === 0) {
            return res.status(404).json({ message: "Event not found or not upcoming" });
        }

        const { eventDate, eventCity, eventCapacity } = details.recordset[0];

        request.input("eventDate", sql.DateTime, eventDate);
        request.input("eventCity", sql.VarChar, eventCity);
        request.input("eventCapacity", sql.Int, eventCapacity);

        const dj = await request.query(`
            SELECT d.Vendor_ID, d.[Name] AS Vendor_Name, d.Contact_No, d.Cost, d.Rating, d.Email, d.Instagram
            FROM DJ_Vendors d 
            WHERE NOT EXISTS (
                SELECT 1 
                FROM Vendor_Bookings vb 
                JOIN Event_Details e ON vb.Event_id = e.Event_ID 
                WHERE vb.DJ_Vendor_ID = d.Vendor_ID 
                AND e.[Date and Time] = @eventDate
            ) 
            ORDER BY d.Rating DESC, d.Cost DESC;
        `);

        res.status(200).json({ success: true, dj: dj.recordset }); // use `dj` as the key

    } catch (err) {
        console.error("Error fetching dj vendors:", err);
        res.status(500).json({ message: "Server error while fetching DJ vendors" });
    }
});


//available decor vendors
app.get("/available-vendors/:eventId/decor", async (req, res) => {
    const eventId = req.params.eventId;
    const request = new sql.Request();

    try {
        if (!eventId) return res.status(400).json({ message: "Event ID required" });

        request.input("eventId", sql.Int, eventId);

        // Fetch Event Details
        const details = await request.query(`
            SELECT [Date and Time] AS eventDate, City AS eventCity, No_Of_Guests AS eventCapacity
            FROM Event_Details WHERE Event_ID = @eventId AND [Date and Time] > GETDATE()
        `);

        if (details.recordset.length === 0) {
            return res.status(404).json({ message: "Event not found or not upcoming" });
        }

        const { eventDate, eventCity, eventCapacity } = details.recordset[0];

        request.input("eventDate", sql.DateTime, eventDate);
        request.input("eventCity", sql.VarChar, eventCity);
        request.input("eventCapacity", sql.Int, eventCapacity);

        const decor = await request.query(`
             SELECT d.Vendor_ID, d.[Name] AS Vendor_Name, d.City, d.Contact_No, d.Cost, d.Rating,d.Email,d.Instagram 
                FROM Decor_Vendor d
                WHERE d.City = @eventCity 
                AND NOT EXISTS (
                    SELECT 1 FROM Vendor_Bookings vb 
                    JOIN Event_Details e ON vb.Event_id = e.Event_ID 
                    WHERE vb.Decor_Vendor_ID = d.Vendor_ID 
                    AND e.[Date and Time] = @eventDate
                ) 
                ORDER BY d.Rating DESC, d.Cost DESC;
        `);

        res.status(200).json({ success: true, decor: decor.recordset });

    } catch (err) {
        console.error("Error fetching decor vendors:", err);
        res.status(500).json({ message: "Server error while fetching decor vendors" });
    }
});

//Available catering vendors
app.get("/available-vendors/:eventId/catering", async (req, res) => {
    const eventId = req.params.eventId;
    const request = new sql.Request();

    try {
        if (!eventId) return res.status(400).json({ message: "Event ID required" });

        request.input("eventId", sql.Int, eventId);

        // Fetch Event Details
        const details = await request.query(`
            SELECT [Date and Time] AS eventDate, City AS eventCity, No_Of_Guests AS eventCapacity
            FROM Event_Details WHERE Event_ID = @eventId AND [Date and Time] > GETDATE()
        `);

        if (details.recordset.length === 0) {
            return res.status(404).json({ message: "Event not found or not upcoming" });
        }

        const { eventDate, eventCity, eventCapacity } = details.recordset[0];

        request.input("eventDate", sql.DateTime, eventDate);
        request.input("eventCity", sql.VarChar, eventCity);
        request.input("eventCapacity", sql.Int, eventCapacity);

        const catering = await request.query(`
            SELECT c.Vendor_ID, c.[Name] AS Vendor_Name, c.City, c.Contact_No, c.Cost, c.Rating,c.Email,c.Instagram
                FROM Catering_Vendor c 
                WHERE c.City = @eventCity 
                AND NOT EXISTS (
                    SELECT 1 FROM Vendor_Bookings vb 
                    JOIN Event_Details e ON vb.Event_id = e.Event_ID 
                    WHERE vb.Catering_Vendor_ID = c.Vendor_ID 
                    AND e.[Date and Time] = @eventDate
                ) 
                ORDER BY c.Rating DESC, c.Cost DESC;
        `);

        res.status(200).json({ success: true, catering: catering.recordset });

    } catch (err) {
        console.error("Error fetching catering vendors:", err);
        res.status(500).json({ message: "Server error while fetching catering vendors" });
    }
});

// Book Hall Vendor for an Event
app.post("/book-hall-vendor", async (req, res) => {
    try {
        const { eventId, hallVendorId } = req.body;
        if (!eventId || !hallVendorId) {
            return res.status(400).json({ success: false, message: "Event ID and Hall Vendor ID are required" });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);
        request.input("hallVendorId", sql.Int, hallVendorId);

        // 1. Update Vendor_Bookings
        await request.query(`
            UPDATE Vendor_Bookings
            SET Hall_Vendor_ID = @hallVendorId
            WHERE Event_id = @eventId;
        `);

        // 2. Insert into Payments
        await request.query(`
            INSERT INTO Payments (Wedding_ID, Event_ID, Vendor_Type, Cost, Payment_Status, Due_Date)
            VALUES (
                (SELECT Wedding_ID FROM Event_Details WHERE Event_ID = @eventId),
                @eventId,
                'Hall',
                (SELECT Cost FROM Hall_Vendor WHERE Vendor_ID = @hallVendorId),
                'Pending',
                (SELECT CONVERT(DATE, DATEADD(DAY, 3, [Date and Time])) FROM Event_Details WHERE Event_ID = @eventId)
            );
        `);

        // 3. Update Event Location
        await request.query(`
            UPDATE Event_Details
            SET location_id = (SELECT Location_ID FROM Hall_Vendor WHERE Vendor_ID = @hallVendorId)
            WHERE Event_ID = @eventId;
        `);

        res.status(200).json({ success: true, message: "Hall vendor booked successfully" });

    } catch (err) {
        console.error("Error booking hall vendor:", err);
        res.status(500).json({ success: false, message: "Error booking hall vendor" });
    }
});


app.post("/book-catering-vendor", async (req, res) => {
    try {
        const { eventId, cateringVendorId } = req.body;
        if (!eventId || !cateringVendorId) {
            return res.status(400).json({ success: false, message: "Event ID and catering Vendor ID are required" });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);
        request.input("cateringVendorId", sql.Int, cateringVendorId);

        // Get Wedding_ID, Date, and total guests for event
        const eventResult = await request.query(`
            SELECT Wedding_ID, [Date and Time] AS EventDate, No_Of_Guests
            FROM Event_Details
            WHERE Event_ID = @eventId
        `);

        const event = eventResult.recordset[0];
        if (!event) return res.status(404).json({ success: false, message: "Event not found" });

        const { Wedding_ID, EventDate, No_Of_Guests } = event;

        // Get cost (price per person)
        const vendorRequest = new sql.Request();
        vendorRequest.input("cateringVendorId", sql.Int, cateringVendorId);
        const vendorResult = await vendorRequest.query(`
            SELECT Cost
            FROM Catering_Vendor
            WHERE Vendor_ID = @cateringVendorId
        `);
        const vendor = vendorResult.recordset[0];
        if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

        const totalCost = vendor.Cost * No_Of_Guests;

        // Update Vendor_Bookings
        const updateRequest = new sql.Request();
        updateRequest.input("eventId", sql.Int, eventId);
        updateRequest.input("cateringVendorId", sql.Int, cateringVendorId);
        await updateRequest.query(`
            UPDATE Vendor_Bookings
            SET Catering_Vendor_ID = @cateringVendorId
            WHERE Event_id = @eventId;
        `);

        // Insert into Payments
        const paymentRequest = new sql.Request();
        paymentRequest.input("Wedding_ID", sql.Int, Wedding_ID);
        paymentRequest.input("eventId", sql.Int, eventId);
        paymentRequest.input("totalCost", sql.Decimal(10, 2), totalCost);
        paymentRequest.input("EventDate", sql.DateTime, EventDate);

        await paymentRequest.query(`
            INSERT INTO Payments (Wedding_ID, Event_ID, Vendor_Type, Cost, Payment_Status, Due_Date)
            VALUES (
                @Wedding_ID,
                @eventId,
                'Catering',
                @totalCost,
                'Pending',
                DATEADD(DAY, 3, @EventDate)
            )
        `);

        res.status(200).json({ success: true, message: "Catering vendor booked successfully" });

    } catch (err) {
        console.error("Error booking catering vendor:", err);
        res.status(500).json({ success: false, message: "Error booking catering vendor" });
    }
});



// Book Photography Vendor for an Event
app.post("/book-photography-vendor", async (req, res) => {
    try {
        const { eventId, photographyVendorId } = req.body;
        if (!eventId || !photographyVendorId) {
            return res.status(400).json({ success: false, message: "Event ID and photography Vendor ID are required" });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);
        request.input("photographyVendorId", sql.Int, photographyVendorId);

        // 1. Update Vendor_Bookings
        await request.query(`
            UPDATE Vendor_Bookings
            SET Photography_Vendor_ID = @photographyVendorId
            WHERE Event_id = @eventId;
        `);

        // 2. Insert into Payments
        await request.query(`
            INSERT INTO Payments (Wedding_ID, Event_ID, Vendor_Type, Cost, Payment_Status, Due_Date)
            VALUES (
                (SELECT Wedding_ID FROM Event_Details WHERE Event_ID = @eventId),
                @eventId,
                'Photography',
                (SELECT Cost FROM Photography_Vendor WHERE Vendor_ID = @photographyVendorId),
                'Pending',
                (SELECT CONVERT(DATE, DATEADD(DAY, 3, [Date and Time])) FROM Event_Details WHERE Event_ID = @eventId)
            );
        `);

        res.status(200).json({ success: true, message: "photography vendor booked successfully" });

    } catch (err) {
        console.error("Error booking photography vendor:", err);
        res.status(500).json({ success: false, message: "Error booking photography vendor" });
    }
});

// Book Decor Vendor for an Event
app.post("/book-decor-vendor", async (req, res) => {
    try {
        const { eventId, decorVendorId } = req.body;
        if (!eventId || !decorVendorId) {
            return res.status(400).json({ success: false, message: "Event ID and decor Vendor ID are required" });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);
        request.input("decorVendorId", sql.Int, decorVendorId);

        // 1. Update Vendor_Bookings
        await request.query(`
            UPDATE Vendor_Bookings
            SET Decor_Vendor_ID = @decorVendorId
            WHERE Event_id = @eventId;
        `);

        // 2. Insert into Payments
        await request.query(`
            INSERT INTO Payments (Wedding_ID, Event_ID, Vendor_Type, Cost, Payment_Status, Due_Date)
            VALUES (
                (SELECT Wedding_ID FROM Event_Details WHERE Event_ID = @eventId),
                @eventId,
                'Decor',
                (SELECT Cost FROM Decor_Vendor WHERE Vendor_ID = @decorVendorId),
                'Pending',
                (SELECT CONVERT(DATE, DATEADD(DAY, 3, [Date and Time])) FROM Event_Details WHERE Event_ID = @eventId)
            );
        `);

        res.status(200).json({ success: true, message: "decor vendor booked successfully" });

    } catch (err) {
        console.error("Error booking decor vendor:", err);
        res.status(500).json({ success: false, message: "Error booking decor vendor" });
    }
});

// Book DJ Vendor for an Event
app.post("/book-dj-vendor", async (req, res) => {
    try {
        const { eventId, djVendorId } = req.body;
        if (!eventId || !djVendorId) {
            return res.status(400).json({ success: false, message: "Event ID and dj Vendor ID are required" });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);
        request.input("djVendorId", sql.Int, djVendorId);

        // 1. Update Vendor_Bookings
        await request.query(`
            UPDATE Vendor_Bookings
            SET DJ_Vendor_ID = @djVendorId
            WHERE Event_id = @eventId;
        `);

        // 2. Insert into Payments
        await request.query(`
            INSERT INTO Payments (Wedding_ID, Event_ID, Vendor_Type, Cost, Payment_Status, Due_Date)
            VALUES (
                (SELECT Wedding_ID FROM Event_Details WHERE Event_ID = @eventId),
                @eventId,
                'DJ',
                (SELECT Cost FROM DJ_Vendors WHERE Vendor_ID = @djVendorId),
                'Pending',
                (SELECT CONVERT(DATE, DATEADD(DAY, 3, [Date and Time])) FROM Event_Details WHERE Event_ID = @eventId)
            );
        `);

        res.status(200).json({ success: true, message: "dj vendor booked successfully" });

    } catch (err) {
        console.error("Error booking dj vendor:", err.message, err);
        res.status(500).json({ success: false, message: "Error booking dj vendor" });
    }
});


//PAYMENTS
// Get all payments for a user
app.get("/user-payments/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const request = new sql.Request();
        request.input("userId", sql.Int, userId);
        await request.query(`
            Update Payments
            set Payment_Status='Overdue'
            where Due_Date<GETDATE();
            `
        );
        const query = `
            SELECT p.payment_id,
                p.Vendor_Type, 
                p.Cost, 
                p.Payment_Status, 
                p.Due_Date, 
                e.[Type] AS Event_Type, 
                e.[Date and Time] AS Event_Date
            FROM Payments p 
            JOIN Wedding_Table w ON p.Wedding_ID = w.Wedding_ID 
            JOIN Event_Details e ON p.Event_ID = e.Event_ID 
            WHERE w.UserID = @userId
            ORDER BY p.Due_Date;
        `;

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No payments found for this user",
                payments: []
            });
        }

        res.status(200).json({
            success: true,
            payments: result.recordset
        });

    } catch (err) {
        console.error("Error fetching user payments:", {
            message: err.message,
            stack: err.stack,
            sqlError: err.originalError?.info?.message
        });
        res.status(500).json({
            success: false,
            message: "Error fetching user payments: " + err.message
        });
    }
});

// Get due payments (Pending or Overdue) for a specific user
app.get("/due-payments/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const request = new sql.Request();
        request.input("userId", sql.Int, userId);

        const query = `
            SELECT p.payment_id,p.Vendor_Type, p.Cost, p.Payment_Status, p.Due_Date, e.[Type] AS Event_Type
            FROM Payments p JOIN Wedding_Table w ON p.Wedding_ID = w.Wedding_ID JOIN Event_Details e ON p.Event_ID = e.Event_ID 
            WHERE w.UserID = @userId AND p.Payment_Status IN ('Pending', 'Overdue') ORDER BY p.Due_Date;
        `;
        const result = await request.query(query);
        // Format the dates for better readability
        const formattedPayments = result.recordset.map(payment => ({
            ...payment,
            Due_Date: payment.Due_Date
        }));
        res.status(200).json({
            success: true,
            payments: formattedPayments,
            count: formattedPayments.length,
            message: formattedPayments.length === 0
                ? "No due payments found for this user"
                : "Due payments retrieved successfully"
        });

    } catch (err) {
        console.error("Error fetching due payments:", {
            message: err.message,
            stack: err.stack,
            sqlError: err.originalError?.info?.message
        });
        res.status(500).json({
            success: false,
            message: "Error fetching due payments: " + err.message
        });
    }
});

app.put("/update-payment", async (req, res) => {
    try {
        const { paymentId, userId } = req.body;

        // Log the received parameters
        console.log("Received paymentId:", paymentId);
        console.log("Received userId:", userId);

        if (!paymentId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID and User ID are required"
            });
        }

        const request = new sql.Request();
        request.input("paymentId", sql.Int, paymentId);
        request.input("userId", sql.Int, userId);

        // Verify if the payment exists and if it's in 'Pending' or 'Overdue' state
        const checkQuery = `
            SELECT Payment_ID 
            FROM Payments 
            WHERE Payment_ID = @paymentId 
            AND Payment_Status IN ('Pending', 'Overdue')
            AND EXISTS (
                SELECT 1 
                FROM Wedding_Table w
                WHERE w.UserID = @userId AND w.Wedding_ID = (SELECT Wedding_ID FROM Payments WHERE Payment_ID = @paymentId)
            )
        `;

        const checkResult = await request.query(checkQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found, already paid, or invalid user"
            });
        }

        // Update the payment status to 'Paid'
        const updateQuery = `
            UPDATE Payments
            SET Payment_Status = 'Paid'
            WHERE Payment_ID = @paymentId
            AND Payment_Status IN ('Pending', 'Overdue')
        `;

        const result = await request.query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).json({
                success: false,
                message: "Payment could not be updated"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment successfully marked as paid",
            paymentId
        });

    } catch (err) {
        console.error("Error updating payment status:", err);
        res.status(500).json({
            success: false,
            message: "Error updating payment status: " + err.message
        });
    }
});


//TASKS
// Route to get all tasks for a specific user
app.get("/user-tasks/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const request = new sql.Request();
        request.input("userId", sql.Int, userId);

        await request.query(`
            Update Tasks
            set Status='Missed'
            where Due_Date<GETDATE();
            `
        );
        const query = `
            SELECT 
                t.Task_ID,
                t.Task_Name,
                t.Description,
                t.Status,
                t.Due_Date,w.Wedding_ID
            FROM Tasks t
            JOIN Wedding_Table w ON t.Wedding_ID = w.Wedding_ID
            WHERE w.UserID = @userId
            ORDER BY t.Due_Date;
        `;

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No tasks found for this user",
                tasks: []
            });
        }

        res.status(200).json({
            success: true,
            tasks: result.recordset
        });

    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching tasks: " + err.message
        });
    }
});


// Route to update task status
app.put("/update-task", async (req, res) => {
    try {
        const { taskId } = req.body;

        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: "Task ID is required"
            });
        }

        const request = new sql.Request();
        request.input("taskId", sql.Int, taskId);

        const result = await request.query(`
            UPDATE Tasks 
            SET Status = 'Completed' 
            WHERE Due_Date >= GETDATE() 
            AND Task_ID = @taskId 
            AND Status != 'Completed';
        `);

        // Check how many rows were affected
        if (result.rowsAffected[0] > 0) {
            return res.status(200).json({
                success: true,
                message: `Task marked as Completed!`
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No task updated. Either it doesn't exist or already completed."
            });
        }

    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({
            success: false,
            message: "Server error while updating task: " + err.message
        });
    }
});

// add new task
app.post("/addTask", async (req, res) => {
    try {
        const { weddingID, taskName, description, status, dueDate } = req.body;

        if (!weddingID || !taskName || !status || !dueDate) {
            return res.status(400).json({ message: "Wedding ID, Task Name, Status, and Due Date are required" });
        }

        const request = new sql.Request();
        request.input("weddingID", sql.Int, weddingID);
        request.input("taskName", sql.VarChar, taskName);
        request.input("description", sql.VarChar, description || null); // Handle null descriptions
        request.input("status", sql.VarChar, status);
        request.input("dueDate", sql.Date, dueDate);

        // Check if the wedding exists
        const checkWeddingQuery = "SELECT * FROM Wedding_Table WHERE Wedding_ID = @weddingID";
        const checkResult = await request.query(checkWeddingQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: "Wedding not found" });
        }

        // Insert task into Tasks table
        const insertQuery = `
            INSERT INTO Tasks (Wedding_ID, Task_Name, Description, Status, Due_Date) 
            VALUES (@weddingID, @taskName, @description, @status, @dueDate);
            SELECT SCOPE_IDENTITY() AS TaskID;
        `;

        const result = await request.query(insertQuery);
        const taskID = result.recordset[0].TaskID;

        res.status(201).json({ success: true, message: "Task added successfully!", taskID });

    } catch (err) {
        console.error("Error adding task:", err);
        res.status(500).json({ message: "Server error while adding task: " + err.message });
    }
});


// delete a task
app.delete("/Deletetasks", async (req, res) => {
    try {
        const { taskID } = req.body;

        if (!taskID) {
            return res.status(400).json({ message: "Task ID is required" });
        }

        const request = new sql.Request();
        request.input("taskID", sql.Int, taskID);

        // Check if the task exists
        const checkTaskQuery = "SELECT * FROM Tasks WHERE Task_ID = @taskID";
        const checkResult = await request.query(checkTaskQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Delete the task
        const deleteQuery = "DELETE FROM Tasks WHERE Task_ID = @taskID";
        await request.query(deleteQuery);

        res.json({ success: true, message: "Task deleted successfully!" });

    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ message: "Server error while deleting task: " + err.message });
    }
});

//GUESTS
// Get guest list for an event
app.get("/wedding-guests/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Event ID is required"
            });
        }

        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);

        // 1. Get all guests for the event
        const query = `
            SELECT Guest_ID, Family_Name, No_Of_Guests_From_This_Family 
            FROM Guests 
            WHERE Event_ID = @eventId
            ORDER BY Family_Name;
        `;
        const result = await request.query(query);

        // 2. Get max allowed guests for the event
        const query2 = `
            SELECT No_Of_Guests 
            FROM Event_Details 
            WHERE Event_ID = @eventId;
        `;
        const result2 = await request.query(query2);
        const maxGuestsAllowed = result2.recordset[0]?.No_Of_Guests || 0;

        // 3. Calculate total currently added guests
        const totalGuests = result.recordset.reduce((sum, guest) => sum + guest.No_Of_Guests_From_This_Family, 0);

        res.status(200).json({
            success: true,
            eventId,
            guests: result.recordset,
            totalGuests,
            maxGuestsAllowed,
            count: result.recordset.length,
            message: result.recordset.length === 0
                ? "No guests found for this event"
                : "Guests retrieved successfully"
        });

    } catch (err) {
        console.error("Error fetching wedding guests:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching wedding guests: " + err.message
        });
    }
});

// Add guest(s) to an event (only if event is not completed)
app.post("/add-guest", async (req, res) => {
    try {
        const { eventId, familyName, newGuests } = req.body;

        if (!eventId || !familyName || !newGuests || newGuests <= 0) {
            return res.status(400).json({
                success: false,
                message: "Event ID, Family Name, and valid number of guests are required"
            });
        }
        const request = new sql.Request();
        request.input("eventId", sql.Int, eventId);
        const eventQuery = `
            SELECT No_Of_Guests, Invited_Guests, [Status] FROM Event_Details WHERE Event_ID = @eventId
        `;
        const eventResult = await request.query(eventQuery);
        if (eventResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }
        const { No_Of_Guests, Invited_Guests, Status } = eventResult.recordset[0];
        if (Status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Cannot add guests to a completed event"
            });
        }
        if ((Invited_Guests + newGuests) > No_Of_Guests) {
            return res.status(400).json({
                success: false,
                message: "Cannot add guests: exceeds allowed guest limit"
            });
        }
        const insertRequest = new sql.Request();
        insertRequest.input("eventId", sql.Int, eventId);
        insertRequest.input("familyName", sql.VarChar(255), familyName);
        insertRequest.input("newGuests", sql.Int, newGuests);
        const insertQuery = `
            INSERT INTO Guests (Event_ID, Family_Name, No_Of_Guests_From_This_Family)
            VALUES (@eventId, @familyName, @newGuests);
        `;
        await insertRequest.query(insertQuery);
        const updateRequest = new sql.Request();
        updateRequest.input("eventId", sql.Int, eventId);
        updateRequest.input("newGuests", sql.Int, newGuests);

        const updateQuery = `
            UPDATE Event_Details SET Invited_Guests = Invited_Guests + @newGuests WHERE Event_ID = @eventId;
        `;
        await updateRequest.query(updateQuery);

        res.status(200).json({
            success: true,
            message: "Guest(s) added successfully",
            addedGuests: newGuests,
            familyName: familyName,
            eventId: eventId
        });

    } catch (err) {
        console.error("Error adding guests:", {
            message: err.message,
            stack: err.stack,
            sqlError: err.originalError?.info?.message
        });
        res.status(500).json({
            success: false,
            message: "Error adding guests: " + err.message
        });
    }
});

// DELETE Guest from event (only if event is not completed)
app.delete("/delete-guests/:guestId", async (req, res) => {
    try {
        const guestId = parseInt(req.params.guestId);

        if (!guestId) {
            return res.status(400).json({
                success: false,
                message: "Guest ID is required"
            });
        }

        const request = new sql.Request();

        request.input("guestId", sql.Int, guestId);
        const guestQuery = `
            SELECT Event_ID, No_Of_Guests_From_This_Family FROM Guests WHERE Guest_ID = @guestId
        `;
        const guestResult = await request.query(guestQuery);

        if (guestResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Guest not found"
            });
        }
        const eventId = guestResult.recordset[0].Event_ID;
        const guestsToRemove = guestResult.recordset[0].No_Of_Guests_From_This_Family;

        const eventRequest = new sql.Request();
        eventRequest.input("eventId", sql.Int, eventId);
        const eventStatusQuery = `
            SELECT [Status] FROM Event_Details WHERE Event_ID = @eventId
        `;
        const eventStatusResult = await eventRequest.query(eventStatusQuery);
        const eventStatus = eventStatusResult.recordset[0]?.Status;

        if (!eventStatus) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        if (eventStatus === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete guests from a completed event"
            });
        }
        const deleteRequest = new sql.Request();
        deleteRequest.input("guestId", sql.Int, guestId);
        await deleteRequest.query("DELETE FROM Guests WHERE Guest_ID = @guestId");

        const updateRequest = new sql.Request();
        updateRequest.input("eventId", sql.Int, eventId);
        updateRequest.input("guestsToRemove", sql.Int, guestsToRemove);
        await updateRequest.query(`
            UPDATE Event_Details SET Invited_Guests = Invited_Guests - @guestsToRemove WHERE Event_ID = @eventId
        `);

        res.status(200).json({
            success: true,
            message: "Guest deleted and invited guest count updated"
        });

    } catch (err) {
        console.error("Error deleting guest:", {
            message: err.message,
            stack: err.stack,
            sqlError: err.originalError?.info?.message
        });
        res.status(500).json({
            success: false,
            message: "Error deleting guest: " + err.message
        });
    }
});