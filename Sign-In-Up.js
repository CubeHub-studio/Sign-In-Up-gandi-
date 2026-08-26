(function (Scratch) {
    'use strict';

    class SignInUp {
        constructor() {
            // Authentication server
            this.apiUrl = '';

            // Authentication state
            this.token = '';
            this.username = '';
            this.userId = '';
            this.loggedIn = false;

            // Latest request information
            this.response = '';
            this.error = '';
            this.thinking = false;

            // Restore saved session
            try {
                this.token =
                    localStorage.getItem('gandi_auth_token') || '';

                this.username =
                    localStorage.getItem('gandi_auth_username') || '';

                this.userId =
                    localStorage.getItem('gandi_auth_user_id') || '';

                if (this.token) {
                    this.loggedIn = true;
                }
            } catch (e) {
                console.warn(
                    '[Sign-In-Up] Could not restore session.'
                );
            }
        }

        getInfo() {
            return {
                id: 'signinup',
                name: 'Sign In / Up',

                color1: '#5865F2',
                color2: '#4752C4',
                color3: '#3C45A5',

                blocks: [
                    {
                        opcode: 'setApiUrl',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set authentication URL to [URL]',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue:
                                    'https://example.com/api'
                            }
                        }
                    },

                    {
                        opcode: 'signUp',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'sign up username [USERNAME] password [PASSWORD]',
                        arguments: {
                            USERNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'username'
                            },
                            PASSWORD: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'password'
                            }
                        }
                    },

                    {
                        opcode: 'signIn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'sign in username [USERNAME] password [PASSWORD]',
                        arguments: {
                            USERNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'username'
                            },
                            PASSWORD: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'password'
                            }
                        }
                    },

                    {
                        opcode: 'logout',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'log out'
                    },

                    {
                        opcode: 'isLoggedIn',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'logged in?'
                    },

                    {
                        opcode: 'getUsername',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'username'
                    },

                    {
                        opcode: 'getUserId',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'user ID'
                    },

                    {
                        opcode: 'getToken',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'authentication token'
                    },

                    {
                        opcode: 'getResponse',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'authentication response'
                    },

                    {
                        opcode: 'getError',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'authentication error'
                    },

                    {
                        opcode: 'isThinking',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'authentication is processing?'
                    },

                    '---',

                    {
                        opcode: 'postJSON',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'POST JSON [DATA] to [URL]',
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            },
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '/request'
                            }
                        }
                    },

                    {
                        opcode: 'getJSON',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'GET [URL]',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '/user'
                            }
                        }
                    },

                    {
                        opcode: 'clearSession',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear saved session'
                    }
                ]
            };
        }

        setApiUrl(args) {
            this.apiUrl = String(args.URL || '')
                .replace(/\/+$/, '');
        }

        async signUp(args) {
            const username = String(args.USERNAME || '');
            const password = String(args.PASSWORD || '');

            if (!this.apiUrl) {
                this.setError(
                    'Authentication URL has not been set.'
                );
                return;
            }

            if (!username.trim()) {
                this.setError('Username is empty.');
                return;
            }

            if (!password.trim()) {
                this.setError('Password is empty.');
                return;
            }

            this.thinking = true;
            this.error = '';

            try {
                const result = await fetch(
                    this.apiUrl + '/signup',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    }
                );

                const data =
                    await result.json().catch(() => null);

                if (!result.ok) {
                    throw new Error(
                        this.getServerError(
                            data,
                            'Sign-up failed.'
                        )
                    );
                }

                this.response =
                    JSON.stringify(data || {});

                this.processAuthentication(data);

            } catch (error) {
                this.setError(
                    error && error.message
                        ? error.message
                        : String(error)
                );

            } finally {
                this.thinking = false;
            }
        }

        async signIn(args) {
            const username = String(args.USERNAME || '');
            const password = String(args.PASSWORD || '');

            if (!this.apiUrl) {
                this.setError(
                    'Authentication URL has not been set.'
                );
                return;
            }

            if (!username.trim()) {
                this.setError('Username is empty.');
                return;
            }

            if (!password.trim()) {
                this.setError('Password is empty.');
                return;
            }

            this.thinking = true;
            this.error = '';

            try {
                const result = await fetch(
                    this.apiUrl + '/login',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    }
                );

                const data =
                    await result.json().catch(() => null);

                if (!result.ok) {
                    throw new Error(
                        this.getServerError(
                            data,
                            'Sign-in failed.'
                        )
                    );
                }

                this.response =
                    JSON.stringify(data || {});

                this.processAuthentication(data);

            } catch (error) {
                this.setError(
                    error && error.message
                        ? error.message
                        : String(error)
                );

            } finally {
                this.thinking = false;
            }
        }

        processAuthentication(data) {
            if (!data) {
                throw new Error(
                    'Server returned an empty response.'
                );
            }

            if (data.success === false) {
                throw new Error(
                    data.error ||
                    data.message ||
                    'Authentication failed.'
                );
            }

            if (data.token) {
                this.token = String(data.token);
            }

            if (data.username) {
                this.username =
                    String(data.username);
            }

            if (data.userId !== undefined) {
                this.userId =
                    String(data.userId);
            }

            if (this.token) {
                this.loggedIn = true;
                this.saveSession();
            }
        }

        logout() {
            this.token = '';
            this.username = '';
            this.userId = '';
            this.loggedIn = false;

            this.clearSavedSession();

            this.response =
                JSON.stringify({
                    success: true,
                    message: 'Logged out.'
                });

            this.error = '';
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
            return this.response;
        }

        getError() {
            return this.error;
        }

        isThinking() {
            return this.thinking;
        }

        async postJSON(args) {
            let url = String(args.URL || '');
            const dataText = String(args.DATA || '{}');

            if (!url) {
                this.setError('URL is empty.');
                return;
            }

            if (!/^https?:\/\//i.test(url)) {
                if (!this.apiUrl) {
                    this.setError(
                        'Authentication URL has not been set.'
                    );
                    return;
                }

                url =
                    this.apiUrl +
                    '/' +
                    url.replace(/^\/+/, '');
            }

            let data;

            try {
                data = JSON.parse(dataText);
            } catch (error) {
                this.setError('Invalid JSON.');
                return;
            }

            this.thinking = true;
            this.error = '';

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                };

                if (this.token) {
                    headers.Authorization =
                        'Bearer ' + this.token;
                }

                const result = await fetch(
                    url,
                    {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(data)
                    }
                );

                const response =
                    await result.json().catch(
                        () => ({})
                    );

                this.response =
                    JSON.stringify(response);

                if (!result.ok) {
                    throw new Error(
                        this.getServerError(
                            response,
                            'Request failed.'
                        )
                    );
                }

            } catch (error) {
                this.setError(
                    error && error.message
                        ? error.message
                        : String(error)
                );

            } finally {
                this.thinking = false;
            }
        }

        async getJSON(args) {
            let url = String(args.URL || '');

            if (!url) {
                this.setError('URL is empty.');
                return;
            }

            if (!/^https?:\/\//i.test(url)) {
                if (!this.apiUrl) {
                    this.setError(
                        'Authentication URL has not been set.'
                    );
                    return;
                }

                url =
                    this.apiUrl +
                    '/' +
                    url.replace(/^\/+/, '');
            }

            this.thinking = true;
            this.error = '';

            try {
                const headers = {
                    'Accept': 'application/json'
                };

                if (this.token) {
                    headers.Authorization =
                        'Bearer ' + this.token;
                }

                const result = await fetch(
                    url,
                    {
                        method: 'GET',
                        headers: headers
                    }
                );

                const response =
                    await result.json().catch(
                        () => ({})
                    );

                this.response =
                    JSON.stringify(response);

                if (!result.ok) {
                    throw new Error(
                        this.getServerError(
                            response,
                            'Request failed.'
                        )
                    );
                }

            } catch (error) {
                this.setError(
                    error && error.message
                        ? error.message
                        : String(error)
                );

            } finally {
                this.thinking = false;
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
            } catch (error) {
                console.warn(
                    '[Sign-In-Up] Could not save session.'
                );
            }
        }

        clearSavedSession() {
            try {
                localStorage.removeItem(
                    'gandi_auth_token'
                );

                localStorage.removeItem(
                    'gandi_auth_username'
                );

                localStorage.removeItem(
                    'gandi_auth_user_id'
                );
            } catch (error) {
                console.warn(
                    '[Sign-In-Up] Could not clear session.'
                );
            }
        }

        clearSession() {
            this.token = '';
            this.username = '';
            this.userId = '';
            this.loggedIn = false;

            this.clearSavedSession();

            this.response = '';
            this.error = '';
        }

        setError(message) {
            this.error = String(message);
            this.response =
                'Error: ' + this.error;

            console.error(
                '[Sign-In-Up]',
                this.error
            );
        }

        getServerError(data, fallback) {
            if (data) {
                if (typeof data.error === 'string') {
                    return data.error;
                }

                if (
                    data.error &&
                    data.error.message
                ) {
                    return data.error.message;
                }

                if (data.message) {
                    return String(data.message);
                }
            }

            return fallback;
        }
    }

    Scratch.extensions.register(
        new SignInUp()
    );

})(Scratch);
