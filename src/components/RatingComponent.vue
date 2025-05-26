<template>
  <div class="rating-container">
    <div class="rating-stars">
      <span 
        v-for="star in 5" 
        :key="star" 
        class="star" 
        :class="{ 'filled': star <= value, 'hovered': star <= hoveredRating }"
        @mouseover="hoveredRating = star"
        @mouseleave="hoveredRating = 0"
        @click="updateRating(star)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </span>
    </div>
    <div class="rating-text" v-if="showText">
      {{ ratingText }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'RatingComponent',
  props: {
    value: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showText: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      hoveredRating: 0
    }
  },
  computed: {
    ratingText() {
      const rating = this.hoveredRating || this.value;
      const texts = [
        '請評分',
        '非常差',
        '差',
        '一般',
        '好',
        '非常好'
      ];
      return texts[rating] || texts[0];
    }
  },
  methods: {
    updateRating(rating) {
      if (this.disabled) return;
      this.$emit('update:value', rating);
      this.$emit('change', rating);
    }
  }
}
</script>

<style scoped>
.rating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.rating-stars {
  display: flex;
  gap: 5px;
}

.star {
  cursor: pointer;
  color: #d1d1d1;
  transition: color 0.2s ease;
}

.star.filled {
  color: #FFD700;
}

.star.hovered {
  color: #FFC107;
}

.rating-text {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
}

/* 禁用狀態 */
.rating-container.disabled .star {
  cursor: default;
  opacity: 0.7;
}
</style>
