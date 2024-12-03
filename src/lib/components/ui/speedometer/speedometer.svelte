<script lang="ts">
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    let {calculatedSpeed} = $props()

    let speed = tweened(0, { duration: 500, easing: cubicOut });

    let needle: HTMLElement;
    let valueElement: HTMLElement;

    const bindNeedle = (node: HTMLElement) => {
        needle = node;
    };

    const bindValue = (node: HTMLElement) => {
        valueElement = node;
    };

    const labels = [0, 25, 50, 75, 100, 125, 150, 175, 200];

    const calculatePosition = (value: number) => {
        const angle = (225 + (value / 200) * 270) * (Math.PI / 180);
        const radius = 90;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        return { x, y };
    };

    $effect(() => {
        updateSpeed(calculatedSpeed);
    });

    const updateSpeed = (newSpeed: number) => {
        const angleRange = 270;
        const startAngle = 225;
        const angle = startAngle - (newSpeed / 200) * angleRange;

        console.log(`Speed: ${newSpeed}, Angle: ${angle}`);
        speed.set(newSpeed);
        needle!.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
        valueElement.textContent = newSpeed.toFixed(0);
    };

</script>

<style>
    .speedometer-wrapper {
        position: fixed;
        bottom: 10%;
        left: 0;
        z-index: 999;
    }

    .analog-speedometer {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 250px;
        height: 250px;
    }

    .speedometer {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background-color: #f5f5f5;
        position: relative;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .speedometer__needle {
        width: 2px;
        height: 100px;
        background-color: #333;
        position: absolute;
        top: 50%;
        left: 50%;
        transform-origin: 50% 100%;
        transform: translate(-50%, -100%) rotate(225deg);
        transition: transform 0.5s;
    }

    .speedometer__value {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        color: #333;
    }

    .speedometer__label {
        position: absolute;
        font-size: 12px;
        color: #333;
        transform: translate(-50%, -50%);
    }
</style>

<div class="speedometer-wrapper">
    <div class="analog-speedometer">
        <div class="speedometer">
            <div class="speedometer__needle" use:bindNeedle></div>
            <div class="speedometer__value" use:bindValue>0</div>

            {#each labels as label}
                <div
                        class="speedometer__label"
                        style="left: calc(50% + {calculatePosition(label).x}px); top: calc(50% - {calculatePosition(label).y}px);"
                >
                    {label}
                </div>
            {/each}

            <div class="speedometer__unit" style="top: 85%; left: 50%;">km/h</div>
        </div>
    </div>
</div>
