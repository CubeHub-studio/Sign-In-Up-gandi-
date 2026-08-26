(function (Scratch) {
    "use strict";

    const API_DEFAULT =
        "https://sign-in-up-api.inakuu69.workers.dev";

    class SignInUp {
        constructor() {
            this.apiUrl = API_DEFAULT;

            this.token = "";
            this.username = "";
            this.userId = "";

            this.lastResponse = "";
            this.lastError = "";
            this.lastStatus = 0;

            this.loggedIn = false;
            this.banned = false;
            this.accountStatus = "";
        }

        getInfo() {
            return {
                id: "signInUp",
                name: "Sign-In-Up",

                color1: "#4C97FF",
                color2: "#3373CC",
                color3: "#2355A0",

                blocks: [

                    // =========================
                    // API
                    // =========================

                    {
                        opcode: "setApiUrl",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set API URL to [URL]",
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: API_DEFAULT
                            }
                        }
                    },

                    {
                        opcode: "apiUrl",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "API URL"
                    },

                    {
                        opcode: "postJson",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "POST JSON [DATA] to [URL]",
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "{}"
                            },
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: API_DEFAULT
                            }
                        }
                    },

                    {
                        opcode: "lastResponse",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "last API response"
                    },

                    {
                        opcode: "apiError",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "API error"
                    },

                    {
                        opcode: "apiStatus",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "API status code"
                    },

                    // =========================
                    // ACCOUNT
                    // =========================

                    {
                        opcode: "signUp",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Sign Up username [USERNAME] password [PASSWORD]",
                        arguments: {
                            USERNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "username"
                            },
                            PASSWORD: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "password"
                            }
                        }
                    },

                    {
                        opcode: "signIn",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Sign In username [USERNAME] password [PASSWORD]",
                        arguments: {
                            USERNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "username"
                            },
                            PASSWORD: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "password"
                            }
                        }
                    },

                    {
                        opcode: "signOut",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Sign Out"
                    },

                    {
                        opcode: "loggedIn",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "Logged In?"
                    },

                    {
                        opcode: "authToken",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Auth Token"
                    },

                    {
                        opcode: "getUsername",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Username"
                    },

                    {
                        opcode: "getUserId",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "User ID"
                    },

                    // =========================
                    // ACCOUNT STATUS
                    // =========================

                    {
                        opcode: "refreshUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Refresh user"
                    },

                    {
                        opcode: "accountStatus",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Account status"
                    },

                    {
                        opcode: "isBanned",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "Account banned?"
                    },

                    {
                        opcode: "banReason",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Ban reason"
                    },

                    // =========================
                    // ADMIN BAN SYSTEM
                    // =========================

                    {
                        opcode: "banUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Ban user ID [USERID] reason [REASON]",
                        arguments: {
                            USERID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                            REASON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Violation of rules"
                            }
                        }
                    },

                    {
                        opcode: "unbanUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Unban user ID [USERID]",
                        arguments: {
                            USERID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },

                    {
                        opcode: "checkBan",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Check ban for user ID [USERID]",
                        arguments: {
                            USERID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },

                    {
                        opcode: "banCheckResult",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "last ban check says banned?"
                    },

                    {
                        opcode: "lastBanReason",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "last ban reason"
                    },

                    // =========================
                    // AUTHENTICATED REQUEST
                    // =========================

                    {
                        opcode: "authenticatedPost",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "POST JSON [DATA] to [URL] with token",
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "{}"
                            },
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: API_DEFAULT
                            }
                        }
                    }
                ]
            };
        }

        setApiUrl(args) {
            this.apiUrl = String(args.URL || "").replace(/\/+$/, "");
        }

        apiUrl() {
            return this.apiUrl;
        }

        async postJson(args) {
            const url = String(args.URL || "");
            const data = String(args.DATA || "{}");

            this.lastError = "";
            this.lastStatus = 0;

            try {
                const parsed = JSON.parse(data);

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(parsed)
                });

                this.lastStatus = response.status;

                const text = await response.text();

                this.lastResponse = text;

                if (!response.ok) {
                    this.lastError = text;
                }

                return text;

            } catch (error) {
                this.lastError = String(error);
                this.lastResponse = "";
                return "";
            }
        }

        async signUp(args) {
            this.lastError = "";

            const username = String(args.USERNAME || "");
            const password = String(args.PASSWORD || "");

            const result = await this.request(
                "/signup",
                {
                    username,
                    password
                },
                false
            );

            if (result && result.success) {
                this.saveSession(result);
            }
        }

        async signIn(args) {
            this.lastError = "";

            const username = String(args.USERNAME || "");
            const password = String(args.PASSWORD || "");

            const result = await this.request(
                "/login",
                {
                    username,
                    password
                },
                false
            );

            if (result && result.success) {
                this.saveSession(result);
            }
        }

        saveSession(result) {
            this.token = result.token || "";
            this.username = result.username || "";
            this.userId = result.userId || "";

            this.loggedIn = Boolean(this.token);

            this.banned = Boolean(result.banned);

            this.accountStatus =
                result.accountStatus ||
                (this.banned ? "banned" : "active");
        }

        async signOut() {
            if (this.token) {
                await this.request(
                    "/logout",
                    {},
                    true
                );
            }

            this.token = "";
            this.username = "";
            this.userId = "";

            this.loggedIn = false;
            this.banned = false;
            this.accountStatus = "";
        }

        loggedIn() {
            return this.loggedIn;
        }

        authToken() {
            return this.token;
        }

        getUsername() {
            return this.username;
        }

        getUserId() {
            return this.userId;
        }

        async refreshUser() {
            if (!this.token) {
                this.loggedIn = false;
                return;
            }

            const result = await this.request(
                "/user",
                {},
                true,
                "GET"
            );

            if (result && result.success) {
                this.loggedIn = true;

                this.username =
                    result.username || this.username;

                this.userId =
                    result.userId || this.userId;

                this.banned =
                    Boolean(result.banned);

                this.accountStatus =
                    result.accountStatus ||
                    (this.banned ? "banned" : "active");
            } else {
                this.loggedIn = false;
            }
        }

        accountStatus() {
            return this.accountStatus;
        }

        isBanned() {
            return this.banned;
        }

        banReason() {
            return this._banReason || "";
        }

        // =========================
        // ADMIN BAN
        // =========================

        async banUser(args) {
            const userId =
                String(args.USERID || "");

            const reason =
                String(args.REASON || "");

            await this.request(
                "/admin/ban",
                {
                    userId,
                    reason
                },
                true
            );
        }

        async unbanUser(args) {
            const userId =
                String(args.USERID || "");

            await this.request(
                "/admin/unban",
                {
                    userId
                },
                true
            );
        }

        async checkBan(args) {
            const userId =
                String(args.USERID || "");

            const result =
                await this.request(
                    "/admin/check-ban",
                    {
                        userId
                    },
                    true
                );

            if (result) {
                this._lastBanCheck =
                    Boolean(result.banned);

                this._banReason =
                    result.reason || "";
            } else {
                this._lastBanCheck = false;
                this._banReason = "";
            }
        }

        banCheckResult() {
            return Boolean(this._lastBanCheck);
        }

        lastBanReason() {
            return this._banReason || "";
        }

        // =========================
        // AUTHENTICATED POST
        // =========================

        async authenticatedPost(args) {
            const url =
                String(args.URL || "");

            const data =
                String(args.DATA || "{}");

            return await this.request(
                url.replace(this.apiUrl, ""),
                JSON.parse(data),
                true
            );
        }

        // =========================
        // REQUEST HELPER
        // =========================

        async request(
            endpoint,
            body = {},
            authenticated = false,
            method = "POST"
        ) {
            this.lastError = "";
            this.lastStatus = 0;

            let url = endpoint;

            if (!url.startsWith("http")) {
                url = this.apiUrl + endpoint;
            }

            const headers = {
                "Accept": "application/json"
            };

            if (method !== "GET") {
                headers["Content-Type"] =
                    "application/json";
            }

            if (
                authenticated &&
                this.token
            ) {
                headers["Authorization"] =
                    "Bearer " + this.token;
            }

            try {
                const options = {
                    method,
                    headers
                };

                if (method !== "GET") {
                    options.body =
                        JSON.stringify(body);
                }

                const response =
                    await fetch(url, options);

                this.lastStatus =
                    response.status;

                const text =
                    await response.text();

                this.lastResponse = text;

                let result = null;

                try {
                    result = JSON.parse(text);
                } catch {
                    result = null;
                }

                if (!response.ok) {
                    this.lastError =
                        result?.error ||
                        text ||
                        `HTTP ${response.status}`;
                }

                return result;

            } catch (error) {
                this.lastError =
                    String(error);

                this.lastResponse = "";

                return null;
            }
        }

        lastResponse() {
            return this.lastResponse;
        }

        apiError() {
            return this.lastError;
        }

        apiStatus() {
            return this.lastStatus;
        }
    }

    Scratch.extensions.register(
        new SignInUp()
    );

})(Scratch);
