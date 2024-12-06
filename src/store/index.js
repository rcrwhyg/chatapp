import { createStore } from "vuex";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getUrlBase } from "../utils";

export default createStore({
  state: {
    user: null,
    token: null,
    workspace: "",
    channels: [],
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setToken(state, token) {
      state.token = token;
    },
    setWorkspace(state, workspace) {
      state.workspace = workspace;
    },
    setChannels(state, channels) {
      state.channels = channels;
    },
    addMessage(state, message) {
      const channel = state.channels.find((c) => c.id === channel.id);
      if (channel) {
        channel.messages.push(message);
      }
    },
    loadUserState(state) {
      const user = localStorage.getItem("user");
      if (user) {
        state.user = JSON.parse(user);
      }
      const token = localStorage.getItem("token");
      if (token) {
        state.token = token;
      }
      const workspace = localStorage.getItem("workspace");
      if (workspace) {
        state.workspace = JSON.parse(workspace);
      }
      const channels = localStorage.getItem("channels");
      if (channels) {
        state.channels = JSON.parse(channels);
      }
    },
  },
  actions: {
    async signup({ commit }, { workspace, full_name, email, password }) {
      try {
        const response = await axios.post(`${getUrlBase()}/signup`, {
          workspace,
          full_name,
          email,
          password,
        });
        const user = saveUser(response, commit);

        return user;
      } catch (error) {
        console.error("Signup failed", error);
        throw error;
      }
    },
    async signin({ commit }, { email, password }) {
      try {
        const response = await axios.post(`${getUrlBase()}/signin`, {
          email,
          password,
        });

        const user = saveUser(response, commit);
        return user;
      } catch (error) {
        console.error("Signin failed", error);
        throw error;
      }
    },
    sendMessage({ commit, state }, text) {
      const message = {
        id: state.messages.length + 1,
        user: state.user.name,
        text,
      };
      commit("addMessage", message);
    },
  },
  getters: {
    getMessages: (state) => state.messages,
  },
});

function saveUser(response, commit) {
  const token = response.data.token;
  const user = jwtDecode(token);
  const workspace = { id: user.wsId, name: user.wsName };

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  localStorage.setItem("workspace", JSON.stringify(workspace));

  commit("setUser", user);
  commit("setToken", token);
  commit("setWorkspace", workspace);
  return user;
}
