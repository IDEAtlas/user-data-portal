// Utilities
import { defineStore } from 'pinia'


export const useAuthStore = defineStore('auth', {
    state: () => {
        return {
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            groups: [],
            scope: "",
        }
    },
    getters: {
        getUser(state) {
            return {
                username: state.username,
                firstName: state.firstName,
                lastName: state.lastName,
                email: state.email,
                groups: state.groups,
                scope: state.scope,
            }
        },
        getFullName(state): string {
          return state.firstName + ' ' + state.lastName
        },
        getUsername(state):string {
            return state.username;
        },
        getUserEmail(state):string {
            return state.email;
        },
        getInitials(state):string {
            return state.firstName.substring(0,1)+state.lastName.substring(0,1);
        },
        getUserOrAdmin(state):string {
            if (state.scope.includes('admin'))
                return 'admin'
            else
                return 'user'
        }
    },
    actions: {
        setUser(user: {
            username: string; firstName: string; lastName: string; email: string; groups: any; scope: any;
        }) {
            this.username = user.username;
            this.firstName = user.firstName;
            this.lastName = user.lastName;
            this.email = user.email;
            this.groups = user.groups;
            this.scope = user.scope;
        },
        logout() {
            this.username = "";
            this.firstName = "";
            this.lastName = "";
            this.email = "";
            this.groups = [];
            this.scope = "";
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
    }
})
