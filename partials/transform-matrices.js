
module.exports = {
    getFromMatrix: function(matrix) {
        return {
            skewX: 0,
            skewY: 0,
            translateX: 0,
            translateY: 0,
            rotate: 0, // no x vs y
            scaleX: 0,
            scaleY: 0
        }
    },
    getFromMatrix3d: function(matrix) {
        return {
            skewX: 0,
            skewY: 0,
            skewZ: 0,
            translateX: 0,
            translateY: 0,
            translateZ: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scaleX: 0,
            scaleY: 0,
            scaleZ: 0
        }
    }
};
