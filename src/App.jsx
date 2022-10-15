import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

// * Will be creating the entire todo app in App.jsx
// * How HARD can it be?

const queryClient = new QueryClient();

const API_URL = "http://localhost:3210/todos/";

const API = axios.create({
  baseURL: API_URL,
});

const ENDPOINTS = {
  getAllTodos: () => "",
  addNewTodo: () => "add",
  updateTodoById: (id) => `update/${id}`,
  deleteTodoById: (id) => `delete/${id}`,
};

// A simple request & response interceptor. Nothing fancy.
API.interceptors.request.use(
  (config) => {
    config.headers["Access-Control-Allow-Origin"] = "*";
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error.response.data)
);

API.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response.data)
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}

const Todos = () => {
  const [todo, setTodo] = useState("");
  const qc = useQueryClient();

  // Get all todos
  const getAllTodos = useQuery(["getAllTodos"], async () => {
    return await API.get(ENDPOINTS.getAllTodos());
  });

  const addNewTodo = useMutation((newTodo) => {
    return API.post(ENDPOINTS.addNewTodo(), newTodo).then(() => {
      getAllTodos.refetch();
    });
  });

  const updateTodoById = useMutation(({ todoId, updatedTodo }) => {
    return API.put(ENDPOINTS.updateTodoById(todoId), updatedTodo).then(() => {
      getAllTodos.refetch();
    });
  });

  const deleteTodoById = useMutation((todoId) => {
    return API.delete(ENDPOINTS.deleteTodoById(todoId)).then(() => {
      getAllTodos.refetch();
    });
  });

  return (
    <section className="container my-5">
      <h1>To do:</h1>
      <section>
        <input
          type="text"
          name="todo-input"
          id="todo-input"
          placeholder="'buy bread'"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <button
          type="submit"
          className={`btn btn-${
            addNewTodo.isIdle || addNewTodo.isSuccess
              ? "primary"
              : addNewTodo.isLoading
              ? "secondary"
              : "danger"
          }`}
          disabled={addNewTodo.isLoading}
          onClick={(e) => {
            e.preventDefault();
            if (todo) {
              addNewTodo.mutate({ task: todo });
              setTodo("");
            }
          }}
        >
          {addNewTodo.isLoading && (
            <>
              <span
                className="spinner-grow spinner-grow-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Loading...</span>
            </>
          )}
          {addNewTodo.isError && <i className="bi bi-exclamation-triangle"></i>}
          {(addNewTodo.isIdle || addNewTodo.isSuccess) && (
            <i className="bi bi-plus-lg"></i>
          )}
        </button>
      </section>
      <section>
        {getAllTodos.isLoading && "Loading..."}
        {getAllTodos.isError && "Error occured"}
        {getAllTodos.isSuccess && (
          <ul>
            {getAllTodos.data.map((todo, index) => (
              <li key={index} className="my-2">
                <article>
                  <section
                    onClick={() => {
                      updateTodoById.mutate({
                        todoId: todo._id,
                        updatedTodo: {
                          completed: !Boolean(todo.completed),
                        },
                      });
                    }}
                  >
                    {todo.completed ? (
                      <s>{todo.task}</s>
                    ) : (
                      <strong>{todo.task}</strong>
                    )}
                  </section>
                  <small>
                    Added: {new Date(todo.created).toLocaleDateString()}
                  </small>
                  <br />
                  <button className="btn btn-sm btn-outline-primary mx-2">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger mx-2"
                    title="Delete"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteTodoById.mutate(todo._id);
                    }}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
};

export default App;
