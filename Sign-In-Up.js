const { BlockType, ArgumentType } = window.Scratch;

class SignInUpExtension {
    constructor(runtime) {
        this.runtime = runtime;

        this.server = '';
        this.token = '';
        this.username = '';
        this.userId = '';
        this.loggedIn = false;
        this.lastResponse = '';
        this.lastError = '';

        // Restore session if the runtime allows localStorage.
        try {
            this.token = localStorage.getItem('gandi_auth_token') || '';
            this.username = localStorage.getItem('gandi_auth_username') || '';
            this.userId = localStorage.getItem('gandi_auth_user_id') || '';

            if (this.token) {
                this.loggedIn = true;
            }
        } catch (e) {
            console.warn('Sign-In-Up: localStorage unavailable');
        }
    }

    getInfo() {
        return {
            id: 'signInUp',
            name: 'Sign In / Up',
            color1: '#5865F2',
            color2: '#4752C4',
            color3: '#3C45A5',

            blocks: [
                {
                    opcode: 'setServer',
                    blockType: BlockType.COMMAND,
                    text: 'set auth server to [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://example.com/api'
                        }
                    }
                },

                {
                    opcode: 'signUp',
                    blockType: BlockType.REPORTER,
                    text: 'sign up username [USERNAME] password [PASSWORD]',
                    arguments: {
                        USERNAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'username'
                        },
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'password'
                        }
                    }
                },

                {
                    opcode: 'signIn',
                    blockType: BlockType.REPORTER,
                    text: 'sign in username [USERNAME] password [PASSWORD]',
                    arguments: {
                        USERNAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'username'
                        },
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'password'
                        }
                    }
                },

                {
                    opcode: 'logout',
                    blockType: BlockType.COMMAND,
                    text: 'log out'
                },

                {
                    opcode: 'isLoggedIn',
                    blockType: BlockType.BOOLEAN,
                    text: 'logged in?'
                },

                {
                    opcode: 'getUsername',
                    blockType: BlockType.REPORTER,
                    text: 'username'
                },

                {
                    opcode: 'getUserId',
                    blockType: BlockType.REPORTER,
                    text: 'user ID'
                },

                {
                    opcode: 'getToken',
                    blockType: BlockType.REPORTER,
                    text: 'authentication token'
                },

                {
                    opcode: 'getResponse',
                    blockType: BlockType.REPORTER,
                    text: 'last response'
                },

                {
                    opcode: 'getError',
                    blockType: BlockType.REPORTER,
                    text: 'last error'
                },

                '---',

                {
                    opcode: 'postJSON',
                    blockType: BlockType.REPORTER,
                    text: 'POST JSON [DATA] to [URL]',
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '{}'
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: '/auth'
                        }
                    }
                },

                {
                    opcode: 'getJSON',
                    blockType: BlockType.REPORTER,
                    text: 'GET [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: '/user'
                        }
                    }
                },

                {
                    opcode: 'clearSession',
                    blockType: BlockType.COMMAND,
                    text: 'clear saved session'
                }
            ]
        };
    }

    setServer(args) {
        this.server = String(args.URL || '').replace(/\/+$/, '');
    }

    async signUp(args) {
        const username = String(args.USERNAME || '');
        const password = String(args.PASSWORD || '');

        if (!this.server) {
            this.lastError = 'Authentication server has not been set.';
            return false;
        }

        try {
            const response = await fetch(`${this.server}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await this.readResponse(response);

            if (!response.ok || data.success === false) {
                this.lastError =
                    data.error ||
                    data.message ||
                    `Sign-up failed (${response.status})`;

                return false;
            }

            this.processAuthResponse(data);
            return true;

        } catch (error) {
            this.lastError = error.message || String(error);
            return false;
        }
    }

    async signIn(args) {
        const username = String(args.USERNAME || '');
        const password = String(args.PASSWORD || '');

        if (!this.server) {
            this.lastError = 'Authentication server has not been set.';
            return false;
        }

        try {
            const response = await fetch(`${this.server}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await this.readResponse(response);

            if (!response.ok || data.success === false) {
                this.lastError =
                    data.error ||
                    data.message ||
                    `Sign-in failed (${response.status})`;

                return false;
            }

            this.processAuthResponse(data);
            return true;

        } catch (error) {
            this.lastError = error.message || String(error);
            return false;
        }
    }

    processAuthResponse(data) {
        this.lastResponse = JSON.stringify(data);

        this.lastError = '';

        if (data.token) {
            this.token = String(data.token);
        }

        if (data.username) {
            this.username = String(data.username);
        }

        if (data.userId !== undefined) {
            this.userId = String(data.userId);
        }

        if (this.token) {
            this.loggedIn = true;
            this.saveSession();
        }
    }

    async readResponse(response) {
        const text = await response.text();

        if (!text) {
            return {};
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            return {
                success: response.ok,
                response: text
            };
        }
    }

    logout() {
        this.token = '';
        this.username = '';
        this.userId = '';
        this.loggedIn = false;

        this.clearSavedSession();
    }

    isLoggedIn() {
        return this.loggedIn;
    }

    getUsername() {
        return this.username;
    }

    getUserId() {
        return this.userId;
    }

    getToken() {
        return this.token;
    }

    getResponse() {
        return this.lastResponse;
    }

    getError() {
        return this.lastError;
    }

    async postJSON(args) {
        let url = String(args.URL || '');
        const dataString = String(args.DATA || '{}');

        if (!url) {
            this.lastError = 'No URL provided.';
            return '';
        }

        if (!/^https?:\/\//i.test(url)) {
            if (!this.server) {
                this.lastError = 'No authentication server has been set.';
                return '';
            }

            url = `${this.server}/${url.replace(/^\/+/, '')}`;
        }

        let data;

        try {
            data = JSON.parse(dataString);
        } catch (error) {
            this.lastError = 'Invalid JSON.';
            return '';
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            if (this.token) {
                headers.Authorization = `Bearer ${this.token}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });

            const result = await this.readResponse(response);

            this.lastResponse = JSON.stringify(result);

            if (!response.ok) {
                this.lastError =
                    result.error ||
                    result.message ||
                    `Request failed (${response.status})`;
            } else {
                this.lastError = '';
            }

            return JSON.stringify(result);

        } catch (error) {
            this.lastError = error.message || String(error);
            return '';
        }
    }

    async getJSON(args) {
        let url = String(args.URL || '');

        if (!url) {
            this.lastError = 'No URL provided.';
            return '';
        }

        if (!/^https?:\/\//i.test(url)) {
            if (!this.server) {
                this.lastError = 'No authentication server has been set.';
                return '';
            }

            url = `${this.server}/${url.replace(/^\/+/, '')}`;
        }

        try {
            const headers = {
                'Accept': 'application/json'
            };

            if (this.token) {
                headers.Authorization = `Bearer ${this.token}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            const result = await this.readResponse(response);

            this.lastResponse = JSON.stringify(result);

            if (!response.ok) {
                this.lastError =
                    result.error ||
                    result.message ||
                    `Request failed (${response.status})`;
            } else {
                this.lastError = '';
            }

            return JSON.stringify(result);

        } catch (error) {
            this.lastError = error.message || String(error);
            return '';
        }
    }

    saveSession() {
        try {
            localStorage.setItem(
                'gandi_auth_token',
                this.token
            );

            localStorage.setItem(
                'gandi_auth_username',
                this.username
            );

            localStorage.setItem(
                'gandi_auth_user_id',
                this.userId
            );
        } catch (e) {
            console.warn('Sign-In-Up: could not save session');
        }
    }

    clearSavedSession() {
        try {
            localStorage.removeItem('gandi_auth_token');
            localStorage.removeItem('gandi_auth_username');
            localStorage.removeItem('gandi_auth_user_id');
        } catch (e) {
            console.warn('Sign-In-Up: could not clear session');
        }
    }

    clearSession() {
        this.logout();
        this.lastResponse = '';
        this.lastError = '';
    }
}

export default SignInUpExtension;
