const buildboard = () => {
    // Variables
    var gl; // глобальная переменная для контекста WebGL

    // Methods of class
    // Public method to start buildboard app
    const start = () => {
        let canvas = document.getElementById("glcanvas");

        gl = initWebGL(canvas); // инициализация контекста GL

        // продолжать только если WebGL доступен и работает
        if (gl) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
            gl.enable(gl.DEPTH_TEST);                                 // включает использование буфера глубины
            gl.depthFunc(gl.LEQUAL);                                  // определяет работу буфера глубины: более ближние объекты перекрывают дальние
            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);        // очистить буфер цвета и буфер глубины.
        }
    }

    // Private method to init WebGL
    const initWebGL = (canvas) => {
        gl = null;

        try {
            // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        }
        catch(e) {}

        // Если мы не получили контекст GL, завершить работу
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
            gl = null;
        }

        return gl;
    }

    // Public methods
    return {
        start
    }
};