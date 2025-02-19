import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import React from "react";



const TaskMobile = ({ currentTask, obtenerEquipo }) => {

    return (
        <>
            {currentTask.map((task, index) => (
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography sx={{ fontWeight: 'bold' }}> {obtenerEquipo(task.id_equipo)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Descripción: {task.descripcion}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    )
}


export default TaskMobile;