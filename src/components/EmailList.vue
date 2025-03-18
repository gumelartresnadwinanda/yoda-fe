<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const emails = ref([]);
const loading = ref(true);
const lastRefreshTime = ref<Date | null>(null);
const refreshDisabled = ref(false);
const countdown = ref(0);
const openedEmailId = ref<number | null>(null);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const fetchEmails = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/emails`);
    emails.value = response.data;
    if (emails.value.length > 0) {
      openedEmailId.value = emails.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching emails:", error);
  } finally {
    loading.value = false;
  }
};

const refreshEmails = async () => {
  if (refreshDisabled.value) return;

  try {
    const response = await axios.get(`${apiBaseUrl}/fetch-emails`);
    emails.value = response.data;
    lastRefreshTime.value = new Date();
    refreshDisabled.value = true;
    countdown.value = 180; // 3 minutes countdown

    const interval = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        refreshDisabled.value = false;
        clearInterval(interval);
      }
    }, 1000);
  } catch (error) {
    console.error("Error refreshing emails:", error);
  }
};

const toggleEmail = (id: number) => {
  openedEmailId.value = openedEmailId.value === id ? null : id;
};

onMounted(() => {
  fetchEmails();
  setInterval(fetchEmails, 300000); // Refresh every 5 minutes
});
</script>

<template>
  <div>
    <div class="refresh-container">
      <div>
        <button
          @click="refreshEmails"
          :disabled="refreshDisabled"
          class="refresh-button"
        >
          Refresh Emails
        </button>
        <div v-if="refreshDisabled">Please wait {{ countdown }} seconds</div>
      </div>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-if="emails.length === 0" class="no-emails">
        No emails available. Try refreshing or wait for new emails.
      </div>
      <div v-else>
        <div
          v-for="email in emails"
          :key="email.id"
          class="email"
          @click="toggleEmail(email.id)"
        >
          <div
            :class="{
              active: openedEmailId === email.id,
              nonactive: openedEmailId !== email.id,
            }"
          >
            <div class="email-header">
              <img
                alt="Profile icon"
                class="profile-icon"
                src="https://storage.googleapis.com/a1aa/image/-ngthweFWrsGlh8aSoniWNZi8rdDtO_ouKWxXBSxGC0.jpg"
              />
              <div class="email-info">
                Requested by <b>{{ email.sender }}</b> at
                {{
                  new Date(email.date_received).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              </div>
            </div>
            <div v-if="openedEmailId === email.id">
              <a :href="email.body" target="_blank" class="get-code-button"
                >Get Code</a
              >
              <div class="link-expiry">* Link expires after 15 minutes.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.email {
  border: 1px solid #ccc;
  margin-bottom: 1em;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  gap: 16px;
  display: flex;
  flex-direction: column;
  padding: 0.5em;
  background-color: #f0f0f0;
  color: #000000;
}

.email:hover {
  background-color: #e0e0e0;
}

.email-header {
  display: flex;
  align-items: center;
}

.profile-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 0.5em;
}

.email-info {
  color: #4a4a4a;
}

.active {
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  padding: 1em 2em;
}

.nonactive {
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.refresh-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1em;
}

.refresh-button {
  justify-self: flex-end;
  color: #ffffff;
  background-color: #ff0000;
  padding: 0.5em 1em;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
  display: block;
  text-align: center;
  border: none;
}
.refresh-button:disabled {
  background-color: #cccccc;
}
.refresh-button:disabled:hover {
  background-color: #cccccc;
}
.refresh-button:hover {
  background-color: #cc0000;
  border: none;
}

.get-code-button {
  color: #ffffff;
  background-color: #ff0000;
  padding: 0.5em 1em;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
  display: block;
  text-align: center;
}

.get-code-button:hover {
  background-color: #cc0000;
}

.link-expiry {
  color: #7a7a7a;
  font-size: 0.875em;
  margin-top: 0.5em;
}

.no-emails {
  text-align: center;
  padding: 1em;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 8px;
  color: #4a4a4a;
}
</style>
