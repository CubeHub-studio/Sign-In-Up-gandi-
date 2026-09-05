(function (Scratch) {
    "use strict";

    const API_DEFAULT =
        "https://api.here";


    class SignInUp {
        constructor() {
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
            this._lastBanReason = "";

            this._accountStatus = "Logged out";

            this._adminSecret = "";
        }


        // ====================================================
        // BLOCKS
        // ====================================================

        getInfo() {
            return {
                id: "signInUp",
                name: "Sign-In-Up",

                color1: "#4C97FF",
                color2: "#3373CC",
                color3: "#2355A0",

                blocks: [

                    {
                        opcode: "setApiUrl",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set API URL to [URL]",
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue:
                                    "https://api.here"
                            }
                        }
                    },

                    {
                        opcode: "apiUrl",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "API URL"
                    },


                    // ========================================
                    // GENERIC POST JSON
                    // ========================================

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
                                defaultValue:
                                    "https://api.here"
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


                    // ========================================
                    // ACCOUNT
                    // ========================================

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

                    {
                        opcode: "refreshUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Refresh user"
                    },


                    // ========================================
                    // ACCOUNT STATUS
                    // ========================================

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


                    // ========================================
                    // SEARCH USERS
                    // ========================================

                    {
                        opcode: "searchUsers",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Search Users [QUERY]",
                        arguments: {
                            QUERY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },

                    {
                        opcode: "searchResults",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Search Results"
                    },

                    {
                        opcode: "searchResultCount",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Search Result Count"
                    },


                    // ========================================
                    // ADMIN
                    // ========================================

                    {
                        opcode: "setAdminSecret",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set admin secret to [SECRET]",
                        arguments: {
                            SECRET: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },

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
                                defaultValue:
                                    "Violation of rules"
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


                    // ========================================
                    // AUTHENTICATED POST
                    // ========================================

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
                                defaultValue:
                                    "https://api.here"
                            }
                        }
                    }
                ]
            };
        }


        // ====================================================
        // INTERNAL REQUEST
        // ====================================================

        async _post(url, data, extraHeaders = {}) {
            this.lastError = "";
            this.lastStatus = 0;

            let body;

            try {
                body =
                    typeof data === "string"
                        ? JSON.parse(data)
                        : data;
            } catch (error) {
                this.lastError =
                    "Invalid JSON: " + error.message;

                return null;
            }

            const headers = {
                "Content-Type": "application/json",
                ...extraHeaders
            };


            // ================================================
            // IMPORTANT:
            //
            // Automatically send the current session token.
            //
            // This fixes:
            //
            // 401 Missing Authorization header
            // ================================================

            if (this.token) {
                headers.Authorization =
                    "Bearer " + this.token;
            }


            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body)
                });

                this.lastStatus = response.status;

                const text = await response.text();

                this.lastResponse = text;

                let parsed;

                try {
                    parsed = JSON.parse(text);
                } catch {
                    parsed = null;
                }

                if (!response.ok) {
                    this.lastError =
                        parsed?.error ||
                        text ||
                        `HTTP ${response.status}`;
                }

                return parsed;
            } catch (error) {
                this.lastError =
                    error?.message ||
                    String(error);

                return null;
            }
        }


        // ====================================================
        // API URL
        // ====================================================

        setApiUrl(args) {
            this._apiUrl =
                String(args.URL || "").trim();
        }


        apiUrl() {
            return this._apiUrl;
        }


        // ====================================================
        // GENERIC POST JSON
        // ====================================================

        async postJson(args) {
            const url =
                String(args.URL || "").trim();

            const data =
                String(args.DATA || "{}");

            const result =
                await this._post(url, data);

            if (result === null) {
                return this.lastResponse || "";
            }

            return JSON.stringify(result);
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


        // ====================================================
        // SIGN UP
        // ====================================================

        async signUp(args) {
            const username =
                String(args.USERNAME || "");

            const password =
                String(args.PASSWORD || "");

            const result =
                await this._post(
                    this._apiUrl + "/signup",
                    {
                        username,
                        password
                    }
                );

            if (!result) {
                return;
            }

            if (result.success) {
                this.token =
                    String(result.token || "");

                this.username =
                    String(result.username || username);

                this.userId =
                    String(result.userId || "");

                this._loggedIn = true;

                this.banned = false;
                this._banReason = "";

                this._accountStatus = "Logged in";
            }
        }


        // ====================================================
        // SIGN IN
        // ====================================================

        async signIn(args) {
            const username =
                String(args.USERNAME || "");

            const password =
                String(args.PASSWORD || "");

            const result =
                await this._post(
                    this._apiUrl + "/login",
                    {
                        username,
                        password
                    }
                );

            if (!result) {
                return;
            }

            if (result.success) {
                this.token =
                    String(result.token || "");

                this.username =
                    String(result.username || username);

                this.userId =
                    String(result.userId || "");

                this._loggedIn = true;

                this.banned = false;
                this._banReason = "";

                this._accountStatus = "Logged in";
            } else {
                this._loggedIn = false;
                this.token = "";

                this._accountStatus =
                    result.error || "Login failed";
            }
        }


        // ====================================================
        // SIGN OUT
        // ====================================================

        async signOut() {
            if (this.token) {
                await this._post(
                    this._apiUrl + "/logout",
                    {}
                );
            }

            this.token = "";
            this.username = "";
            this.userId = "";

            this._loggedIn = false;

            this.banned = false;
            this._banReason = "";

            this._accountStatus = "Logged out";
        }


        // ====================================================
        // LOGGED IN
        // ====================================================

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


        // ====================================================
        // REFRESH USER
        // ====================================================

        async refreshUser() {
            if (!this.token) {
                this._loggedIn = false;
                return;
            }

            try {
                const response =
                    await fetch(
                        this._apiUrl + "/user",
                        {
                            method: "GET",
                            headers: {
                                Authorization:
                                    "Bearer " + this.token
                            }
                        }
                    );

                this.lastStatus =
                    response.status;

                const text =
                    await response.text();

                this.lastResponse = text;

                const result =
                    JSON.parse(text);

                if (!response.ok || !result.success) {
                    this._loggedIn = false;

                    if (response.status === 403) {
                        this.banned = true;

                        this._banReason =
                            result.reason ||
                            result.error ||
                            "";
                    }

                    return;
                }

                this._loggedIn = true;

                this.userId =
                    String(result.user?.id || "");

                this.username =
                    String(result.user?.username || "");

                this.banned =
                    result.user?.banned === true;

                this._banReason =
                    String(
                        result.user?.banReason || ""
                    );

                this._accountStatus =
                    this.banned
                        ? "Banned"
                        : "Logged in";

            } catch (error) {
                this.lastError =
                    error?.message ||
                    String(error);
            }
        }


        // ====================================================
        // ACCOUNT STATUS
        // ====================================================

        accountStatus() {
            return this._accountStatus;
        }


        isBanned() {
            return this.banned;
        }


        banReason() {
            return this._banReason;
        }


        // ====================================================
        // SEARCH USERS
        // ====================================================

        async searchUsers(args) {
            const query =
                String(args.QUERY || "");

            /*
             * IMPORTANT:
             *
             * We POST directly to the Worker root:
             *
             * POST https://worker.workers.dev/
             *
             * {
             *     "query": "..."
             * }
             *
             * _post() automatically adds:
             *
             * Authorization: Bearer TOKEN
             */

            const result =
                await this._post(
                    this._apiUrl,
                    {
                        query
                    }
                );

            if (!result) {
                return;
            }

            if (result.success) {
                this._searchResults =
                    Array.isArray(result.results)
                        ? result.results
                        : [];
            } else {
                this._searchResults = [];
            }
        }


        searchResults() {
            return JSON.stringify(
                this._searchResults || []
            );
        }


        searchResultCount() {
            return (
                this._searchResults || []
            ).length;
        }


        // ====================================================
        // ADMIN SECRET
        // ====================================================

        setAdminSecret(args) {
            this._adminSecret =
                String(args.SECRET || "");
        }


        // ====================================================
        // BAN USER
        // ====================================================

        async banUser(args) {
            const userId =
                String(args.USERID || "");

            const reason =
                String(
                    args.REASON ||
                    "Violation of rules"
                );

            await this._post(
                this._apiUrl + "/admin/ban",
                {
                    userId,
                    reason
                },
                this._adminSecret
                    ? {
                        "X-Admin-Secret":
                            this._adminSecret
                    }
                    : {}
            );
        }


        // ====================================================
        // UNBAN USER
        // ====================================================

        async unbanUser(args) {
            const userId =
                String(args.USERID || "");

            await this._post(
                this._apiUrl + "/admin/unban",
                {
                    userId
                },
                this._adminSecret
                    ? {
                        "X-Admin-Secret":
                            this._adminSecret
                    }
                    : {}
            );
        }


        // ====================================================
        // CHECK BAN
        // ====================================================

        async checkBan(args) {
            const userId =
                String(args.USERID || "");

            const result =
                await this._post(
                    this._apiUrl + "/admin/check-ban",
                    {
                        userId
                    },
                    this._adminSecret
                        ? {
                            "X-Admin-Secret":
                                this._adminSecret
                        }
                        : {}
                );

            if (!result) {
                return;
            }

            this._lastBanCheck =
                result.banned === true;

            this._lastBanReason =
                String(result.reason || "");
        }


        banCheckResult() {
            return this._lastBanCheck;
        }


        lastBanReason() {
            return this._lastBanReason;
        }


        // ====================================================
        // EXPLICIT AUTHENTICATED POST
        // ====================================================

        async authenticatedPost(args) {
            const url =
                String(args.URL || "");

            const data =
                String(args.DATA || "{}");

            const result =
                await this._post(
                    url,
                    data
                );

            if (result === null) {
                return this.lastResponse || "";
            }

            return JSON.stringify(result);
        }
    }


    Scratch.extensions.register(
        new SignInUp()
    );

})(Scratch);
