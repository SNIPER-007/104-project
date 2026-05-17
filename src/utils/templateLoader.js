import Papa from "papaparse";

export async function loadTemplates() {

  const response =
    await fetch(
      "dataset/Indian Sign Language Gesture Landmarks.csv"
    );

  const csvText =
    await response.text();

  return new Promise(
    (resolve) => {

      Papa.parse(csvText, {

        header: true,

        dynamicTyping: true,

        complete: (
          results
        ) => {

          const templates =
            {};

          results.data.forEach(
            (row) => {

              const target =
                row.target;

              const letter =
                String.fromCharCode(
                  65 + target
                );

              if (
                templates[
                  letter
                ]
              ) {
                return;
              }

              const leftHand =
                [];

              const rightHand =
                [];

              // LEFT
              for (
                let i = 0;
                i < 21;
                i++
              ) {
                leftHand.push({
                  x:
                    row[
                      `left_hand_x_${i}`
                    ] || 0,

                  y:
                    row[
                      `left_hand_y_${i}`
                    ] || 0,

                  z:
                    row[
                      `left_hand_z_${i}`
                    ] || 0,
                });
              }

              // RIGHT
              for (
                let i = 0;
                i < 21;
                i++
              ) {
                rightHand.push({
                  x:
                    row[
                      `right_hand_x_${i}`
                    ] || 0,

                  y:
                    row[
                      `right_hand_y_${i}`
                    ] || 0,

                  z:
                    row[
                      `right_hand_z_${i}`
                    ] || 0,
                });
              }

              // DETECT ACTIVE HAND
              const leftActive =
                leftHand.some(
                  (p) =>
                    p.x !== 0
                );

              const rightActive =
                rightHand.some(
                  (p) =>
                    p.x !== 0
                );

              templates[
                letter
              ] = {
                hand:
                  rightActive
                    ? "RIGHT"
                    : "LEFT",

                landmarks:
                  rightActive
                    ? rightHand
                    : leftHand,
              };
            }
          );

          resolve(
            templates
          );
        },
      });
    }
  );
}