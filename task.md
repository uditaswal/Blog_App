# Plan -

---

### Deploy Using:

**Option 3** — Best Hybrid (Most Practical)
Frontend → Azure Static Web Apps (FREE tier)
Backend → Azure Container Apps

**Use:**
Docker for containerization.
Github Actions for CI-CD

**Benefits:**

✔ Frontend FREE
✔ Backend scales to zero
✔ Lowest cost
✔ Clean architecture

---

// for reading password during login
// const match = await bcrypt.compare(password, user.password);

// error handling in route
router.get('/', (req, res, next) => {
// res.status(200).json({ msg: "Hello from Server" })
try {
res.render('home');
} catch (error) {
logger.error("Exception occurred: ", error)
next(error);
}

});

add cookies, auuth
