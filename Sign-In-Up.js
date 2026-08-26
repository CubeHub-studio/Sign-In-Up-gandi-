(function (Scratch) {
    "use strict";

    const API_DEFAULT = "https://api.here";

    class SignInUp {
        constructor() {
            // =========================
            // INTERNAL STATE
            // =========================

            this._apiUrl = API_DEFAULT;

            this.token = "";
            this.username = "";
            this.userId = "";

            this.lastResponse = "";
            this.lastError = "";
            this.lastStatus = 0;

            this._loggedIn = false;
            this.banned = false;
            this._banReason = "";
            this._lastBanCheck = false;
            this._accountStatus = "";
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
                                defaultValue: "https://api.here"
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
                                defaultValue: "https://api.here"
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
                                defaultValue: "https://api.here"
                            }
                        }
                    }
                ]
            };
        }

        // =========================
        // API URL
        // =========================

        setApiUrl(args) {
            let url = String(args.URL || "").trim();

            url = url.replace(/\/+$/, "");

            if (!url) {
                this.lastError = "API URL cannot be empty";
                return;
            }

            if (!/^https?:\/\//i.test(url)) {
                this.lastError =
                    "API URL must start with http:// or https://";
                return;
            }

            this._apiUrl = url;
            this.lastError = "";
        }

        apiUrl() {
            return this._apiUrl;
        }

        // =========================
        // RAW POST JSON
        // =========================

        async postJson(args) {
            const url = String(args.URL || "").trim();
            const data = String(args.DATA || "{}");

            this.lastError = "";
            this.lastStatus = 0;
            this.lastResponse = "";

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
                    this.lastError =
                        text || `HTTP ${response.status}`;
                }

                return text;

            } catch (error) {
                this.lastError = String(error);
                this.lastResponse = "";
                return "";
            }
        }

        // =========================
        // SIGN UP
        // =========================

        async signUp(args) {
            this.lastError = "";

            const username =
                String(args.USERNAME || "");

            const password =
                String(args.PASSWORD || "");

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

        // =========================
        // SIGN IN
        // =========================

        async signIn(args) {
            this.lastError = "";

            const username =
                String(args.USERNAME || "");

            const password =
                String(args.PASSWORD || "");

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

        // =========================
        // SAVE SESSION
        // =========================

        saveSession(result) {
            this.token =
                result.token || "";

            this.username =
                result.username || "";

            this.userId =
                result.userId || "";

            this._loggedIn =
                Boolean(this.token);

            this.banned =
                Boolean(result.banned);

            this._accountStatus =
                result.accountStatus ||
                (this.banned
                    ? "banned"
                    : "active");

            this._banReason =
                result.reason ||
                result.banReason ||
                "";
        }

        // =========================
        // SIGN OUT
        // =========================

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

            this._loggedIn = false;
            this.banned = false;
            this._accountStatus = "";
            this._banReason = "";
        }

        // =========================
        // ACCOUNT REPORTERS
        // =========================

        loggedIn() {
            return this._loggedIn;
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

        // =========================
        // REFRESH USER
        // =========================

        async refreshUser() {
            if (!this.token) {
                this._loggedIn = false;
                return;
            }

            const result =
                await this.request(
                    "/user",
                    {},
                    true,
                    "GET"
                );

            if (result && result.success) {
                this._loggedIn = true;

                this.username =
                    result.username ||
                    this.username;

                this.userId =
                    result.userId ||
                    this.userId;

                this.banned =
                    Boolean(result.banned);

                this._accountStatus =
                    result.accountStatus ||
                    (this.banned
                        ? "banned"
                        : "active");

                this._banReason =
                    result.reason ||
                    result.banReason ||
                    this._banReason;

            } else {
                this._loggedIn = false;
            }
        }

        accountStatus() {
            return this._accountStatus;
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

        // =========================
        // ADMIN UNBAN
        // =========================

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

        // =========================
        // CHECK BAN
        // =========================

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
            return Boolean(
                this._lastBanCheck
            );
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

            try {
                const parsed =
                    JSON.parse(data);

                let endpoint = url;

                if (
                    endpoint.startsWith(
                        this._apiUrl
                    )
                ) {
                    endpoint =
                        endpoint.substring(
                            this._apiUrl.length
                        );
                }

                return await this.request(
                    endpoint,
                    parsed,
                    true
                );

            } catch (error) {
                this.lastError =
                    String(error);

                this.lastResponse = "";
                this.lastStatus = 0;

                return null;
            }
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

            let url =
                String(endpoint || "");

            if (
                !/^https?:\/\//i.test(url)
            ) {
                if (!url.startsWith("/")) {
                    url = "/" + url;
                }

                url =
                    this._apiUrl + url;
            }

            const headers = {
                "Accept":
                    "application/json"
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
                    await fetch(
                        url,
                        options
                    );

                this.lastStatus =
                    response.status;

                const text =
                    await response.text();

                this.lastResponse =
                    text;

                let result = null;

                try {
                    result =
                        JSON.parse(text);
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

        // =========================
        // API INFORMATION
        // =========================

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
