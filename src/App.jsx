
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/expanses";

function App() {
  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState("");
const [searchedExpense, setSearchedExpense] = useState(null);

  // GET: Load all expenses
  async function loadExpenses() {
    setLoading(true);

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load expenses.");
      }

      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      setMessage(
        "Could not load expenses. Check whether Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load expenses when the page first opens
  useEffect(() => {
    loadExpenses();
  }, []);

  // Clear the form
  function resetForm() {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate(new Date().toISOString().slice(0, 10));
    setDescription("");
  }

  // POST: Add or PUT: Update an expense
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const isEditing = editingId !== null;

    const expenseData = {
      title,
      amount: Number(amount),
      category,
      date,
      description,
    };

    try {
      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            Object.values(errorData || {}).join(", ") ||
            `Request failed: ${response.status}`
        );
      }

      resetForm();

      setMessage(
        isEditing
          ? "Expense updated successfully!"
          : "Expense added successfully!"
      );

      await loadExpenses();
    } catch (error) {
      setMessage(error.message || "Could not save expense.");
    }
  }

  // Fill the form with an existing expense
  function startEditing(expense) {
    setEditingId(expense.id);
    setTitle(expense.title || "");
    setAmount(String(expense.amount ?? ""));
    setCategory(expense.category || "Other");
    setDate(expense.date || "");
    setDescription(expense.description || "");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // DELETE: Remove an expense
  async function deleteExpense(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          `Could not delete expense. Status: ${response.status}`
        );
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage("Expense deleted successfully!");

      await loadExpenses();
    } catch (error) {
      setMessage(error.message || "Could not delete expense.");
    }
  }

  // Calculate total expenses
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );


async function getExpenseById() {
  if (!searchId.trim()) {
    setMessage("Please enter an expense ID.");
    return;
  }

  setMessage("");
  setSearchedExpense(null);

  try {
    const response = await fetch(`${API_URL}/${searchId}`);

    if (response.status === 404) {
      setMessage("Expense not found.");
      return;
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    setSearchedExpense(data);
    setMessage("Expense found successfully!");
  } catch (error) {
    setMessage(
      "Could not retrieve the expense. Check your backend."
    );
  }
}


  return (
    <main className="container">
      {/* Header and total */}
      <header className="header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>Expense Tracker</h1>
          <p className="subtitle">
            Understand your spending, one expense at a time.
          </p>
        </div>

        <div className="total-card">
          <span>Total expenses</span>
          <h2>₹{total.toFixed(2)}</h2>
          <small>{expenses.length} transactions</small>
        </div>
      </header>

      {/* Add and edit form */}
      <section className="panel">
        <h2>
          {editingId !== null ? "Edit expense" : "Add an expense"}
        </h2>

        <form onSubmit={handleSubmit} className="expense-form">
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Lunch"
              required
            />
          </label>

          <label>
            Amount (₹)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="150.00"
              required
            />
          </label>

          <label>
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label className="full-width">
            Description
            <input
              type="text"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Optional details"
            />
          </label>

          <div className="form-actions">
            <button type="submit">
              {editingId !== null
                ? "Update expense"
                : "+ Add expense"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}
      </section>
      
      {/* Search expense by ID */}
      <section className="panel">
        <h2>Find expense by ID</h2>

        <div className="search-row">
          <input
            type="number"
            min="1"
            placeholder="Enter expense ID"
            value={searchId}
            onChange={(event) => setSearchId(event.target.value)}
          />

          <button type="button" onClick={getExpenseById}>
            Search
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => {
              setSearchId("");
              setSearchedExpense(null);
              setMessage("");
            }}
          >
            Clear
          </button>
        </div>

        {searchedExpense && (
          <div className="search-result">
            <p><strong>ID:</strong> {searchedExpense.id}</p>
            <p><strong>Title:</strong> {searchedExpense.title}</p>
            <p>
              <strong>Amount:</strong> ₹
              {Number(searchedExpense.amount).toFixed(2)}
            </p>
            <p><strong>Category:</strong> {searchedExpense.category}</p>
            <p><strong>Date:</strong> {searchedExpense.date}</p>
            <p>
              <strong>Description:</strong>{" "}
              {searchedExpense.description || "—"}
            </p>
          </div>
        )}
      </section>


      {/* Expense list */}
      <section className="panel">
        <div className="section-heading">
          <h2>Recent expenses</h2>

          <button
            type="button"
            className="secondary"
            onClick={loadExpenses}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading && expenses.length === 0 ? (
          <p className="empty">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="empty">
            No expenses yet. Add your first one above.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>

                    <td>
                      <span className="category">
                        {expense.category}
                      </span>
                    </td>

                    <td>{expense.date}</td>

                    <td className="amount">
                      ₹{Number(expense.amount).toFixed(2)}
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => startEditing(expense)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteExpense(expense.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
  
}

export default App;
