from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import getSampleStyleSheet


def create_pdf(title, content, output_path):

    document = SimpleDocTemplate(
        output_path,
        pagesize=A4
    )

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            title,
            styles["Title"]
        )
    )

    story.append(
        Spacer(1, 20)
    )

    for item in content:

        if isinstance(item, dict):

            if item.get("heading"):
                story.append(
                    Paragraph(
                        item["heading"],
                        styles["Heading2"]
                    )
                )

            if item.get("text"):
                story.append(
                    Paragraph(
                        item["text"],
                        styles["BodyText"]
                    )
                )

        else:

            story.append(
                Paragraph(
                    str(item),
                    styles["BodyText"]
                )
            )

        story.append(
            Spacer(1, 10)
        )

    document.build(story)

    return output_path
