import { createStore } from "vuex";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getUrlBase } from "../utils";

export default createStore({
  state: {
    user: null,
    token: null,
    workspace: {},
    channels: [],
    messages: {},
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
    setMessages(state, messages) {
      state.messages = messages;
    },
    addChannel(state, channel) {
      state.channels.push(channel);
      state.messages[channel.id] = [];
    },
    addMessage(state, { channelId, message }) {
      if (state.messages[channelId]) {
        state.messages[channelId].push(message);
      } else {
        state.messages[channelId] = [message];
      }
    },
    loadUserState(state) {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const workspace = localStorage.getItem("workspace");
      const channels = localStorage.getItem("channels");
      const messages = localStorage.getItem("messages");

      if (user) {
        state.user = JSON.parse(user);
      }
      if (token) {
        state.token = token;
      }
      if (workspace) {
        state.workspace = JSON.parse(workspace);
      }
      if (channels) {
        state.channels = JSON.parse(channels);
      }
      if (messages) {
        state.messages = JSON.parse(messages);
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
    logout({ commit }) {
      // Clear local storage and state
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("workspace");
      localStorage.removeItem("channels");
      localStorage.removeItem("messages");

      commit("setUser", null);
      commit("setToken", null);
      commit("setWorkspace", "");
      commit("setChannels", []);
      commit("setMessages", {});
    },
    addChannel({ commit }, channel) {
      commit("addChannel", channel);

      // Update the channels and messages in local storage
      localStorage.setItem("channels", JSON.stringify(this.state.channels));
      localStorage.setItem("messages", JSON.stringify(this.state.messages));
    },
    addMessage({ commit }, { channelId, message }) {
      commit("addMessage", { channelId, message });

      // Update the messages in local storage
      localStorage.setItem("messages", JSON.stringify(this.state.messages));
    },
    loadUserState({ commit }) {
      commit("loadUserState");
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token;
    },
    getUser(state) {
      return state.user;
    },
    getWorkspace(state) {
      return state.workspace;
    },
    getChannels(state) {
      return state.channels;
    },
    getChannelMessages: (state) => (channelId) => {
      return state.messages[channelId] || [];
    },
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
